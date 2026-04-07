const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/userModel");
const SgiModel = require("../src/models/sgiModel");

// Mockear dependencias duras (MongoDB y FS DB models)
jest.mock("../src/models/userModel", () => ({
  findOne: jest.fn(),
}));

// Mockear bcrypt para evadir test real de hashing
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));
const bcrypt = require("bcryptjs");

// Mockear el SGI Model para que no bloquee con el crawler ni FS reales
jest.mock("../src/models/sgiModel", () => ({
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

describe("Suite de Pruebas CRUD y Autenticación con Supertest y Mocks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. [AUTH] Login y Roles", () => {
    it("Debería retornar 400 si faltan credenciales en POST /api/auth/login", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ username: "test" });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("Debería autenticar correctamente y simular sesión", async () => {
      // Setup de mocks
      User.findOne.mockResolvedValue({
        _id: "mockId123",
        username: "admin",
        password: "hashedPassword123",
        role: "admin",
        displayName: "Jefe Admin",
        permissions: ["sgi", "news"],
      });
      bcrypt.compare.mockResolvedValue(true);

      const agent = request.agent(app); // Agent guarda cookies de session
      const response = await agent
        .post("/api/auth/login")
        .send({ username: "admin", password: "123" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe("admin");

      // Verify that checkSession passes with the agent
      const checkRes = await agent.get("/api/auth/check");
      expect(checkRes.status).toBe(200);
      expect(checkRes.body.user.displayName).toBe("Jefe Admin");
    });
  });

  describe("2. [CRUD] Modificaciones protegidas en Endpoints usando el Escudo Global", () => {
    it("Debería bloquear POST a SGI si el usuario es anónimo", async () => {
      const response = await request(app)
        .post("/api/sgi/planeacion")
        .send({ name: "Documento Secreto", category: "Estrategia", fileUrl: "#" });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/denegado|iniciar sesión/i);
    });

    it("Debería permitir CREAR y EJECUTAR LÓGICA DE MODELO al tener sesión", async () => {
      // Mockear la creación exitosa del SGI (mock returns an ID)
      SgiModel.create.mockReturnValue("sgi-fake-id-999");

      // Setup session agent logged in
      User.findOne.mockResolvedValue({ _id: "m", username: "admin", role: "admin", password: "h" });
      bcrypt.compare.mockResolvedValue(true);
      const agent = request.agent(app);
      await agent.post("/api/auth/login").send({ username: "admin", password: "any" });

      const response = await agent
        .post("/api/sgi/planeacion")
        .send({ name: "Protocolo 1", category: "General", fileUrl: "/path.pdf" });

      expect(response.status).toBe(201);
      expect(response.body.message).toMatch(/Item creado/i);
      expect(SgiModel.create).toHaveBeenCalledWith("planeacion", "Protocolo 1", "General", "/path.pdf");
    });

    it("Debería permitir ELIMINAR llamando al borrador de FS", async () => {
      // Mock delete returns true
      SgiModel.delete.mockReturnValue(true);

      // Auth agent
      User.findOne.mockResolvedValue({ _id: "m", username: "admin", role: "admin", password: "h" });
      bcrypt.compare.mockResolvedValue(true);
      const agent = request.agent(app);
      await agent.post("/api/auth/login").send({ username: "admin", password: "any" });

      const response = await agent.delete("/api/sgi/planeacion/sgi-fake-id-999");
      
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/eliminado/i);
      expect(SgiModel.delete).toHaveBeenCalledWith("planeacion", "sgi-fake-id-999");
    });
  });
});
