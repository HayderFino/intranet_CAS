const UsersAdmin = (() => {
  const listContainer = document.getElementById("usersList");
  const userForm = document.getElementById("userForm");
  const userEditId = document.getElementById("userEditId");
  const userDisplayName = document.getElementById("userDisplayName");
  const userUsername = document.getElementById("userUsername");
  const userPassword = document.getElementById("userPassword");
  const userRole = document.getElementById("userRole");
  const userSaveBtn = document.getElementById("userSaveBtn");
  const userCancelBtn = document.getElementById("userCancelBtn");

  function getPerms() {
    return {
      // General
      banner: document.getElementById("perm-banner"),
      eventos: document.getElementById("perm-eventos"),
      correos: document.getElementById("perm-correos"),
      informe_gestion: document.getElementById("perm-informe_gestion"),

      // NotiCAS
      news: document.getElementById("perm-news"),
      agenda_cas: document.getElementById("perm-agenda_cas"),

      // SGI
      sgi_planeacion: document.getElementById("perm-sgi_planeacion"),
      sgi_mejora: document.getElementById("perm-sgi_mejora"),
      sgi_recursos: document.getElementById("perm-sgi_recursos"),
      sgi_ambiental: document.getElementById("perm-sgi_ambiental"),
      sgi_vigilancia: document.getElementById("perm-sgi_vigilancia"),
      sgi_control: document.getElementById("perm-sgi_control"),
      sgi_manuales: document.getElementById("perm-sgi_manuales"),
      sgi_politicas: document.getElementById("perm-sgi_politicas"),

      // Herramientas
      respel: document.getElementById("perm-respel"),
      rua: document.getElementById("perm-rua"),
      boletines_git: document.getElementById("perm-boletines_git"),
      pcb: document.getElementById("perm-pcb"),

      // GIT
      cita: document.getElementById("perm-cita"),
      sirh: document.getElementById("perm-sirh"),
      revision_red: document.getElementById("perm-revision_red"),
      snif: document.getElementById("perm-snif"),

      // Seguridad
      users: document.getElementById("perm-users"),

      // MECI
      meci: document.getElementById("perm-meci"),

      // Talento Humano
      manual_funciones: document.getElementById("perm-manual_funciones"),
      sigep: document.getElementById("perm-sigep"),
      planes_talento: document.getElementById("perm-planes_talento"),
      convocatorias: document.getElementById("perm-convocatorias"),
      estudios_tecnicos: document.getElementById("perm-estudios_tecnicos"),
      provision_empleos: document.getElementById("perm-provision_empleos"),
    };
  }

  function init() {
    if (!userForm) return;

    loadUsers();

    userForm.onsubmit = async (e) => {
      e.preventDefault();
      const id = userEditId.value;
      const method = id ? "PUT" : "POST";
      const url = id ? `../api.php?route=users/${id}` : "../api.php?route=users";

      const permissions = {};
      const permsElements = getPerms();
      Object.keys(permsElements).forEach((key) => {
        if (permsElements[key]) {
          permissions[key] = permsElements[key].checked;
        }
      });

      const data = {
        displayName: userDisplayName.value,
        username: userUsername.value,
        password: userPassword.value,
        role: userRole.value,
        permissions,
      };

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();

        if (res.ok) {
          window.showToast(id ? "Usuario actualizado" : "Usuario creado");
          resetForm();
          loadUsers();
        } else {
          window.showToast(result.message || "Error al guardar", "error");
        }
      } catch (err) {
        window.showToast("Error de conexión", "error");
      }
    };

    userCancelBtn.onclick = resetForm;
  }

  async function loadUsers() {
    try {
      const res = await fetch("../api.php?route=users");
      const users = await res.json();

      listContainer.innerHTML = users
        .map(
          (user) => `
                <div class="news-management-item">
                    <div class="item-info">
                        <strong>${user.displayName} (@${user.username})</strong>
                        <span class="badge ${user.role}">${user.role}</span>
                        <div style="font-size: 0.75rem; color: #64748b; margin-top: 5px;">
                            Permisos: ${
                              Object.keys(user.permissions || {})
                                .filter((k) => user.permissions[k])
                                .join(", ") || "Ninguno"
                            }
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="UsersAdmin.editUser('${user.id || user._id}')">Editar</button>
                        ${user.username !== "Admin" ? `<button class="btn-delete" onclick="UsersAdmin.deleteUser('${user.id || user._id}')">Eliminar</button>` : ""}
                    </div>
                </div>
            `,
        )
        .join("");
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    }
  }

  async function editUser(id) {
    try {
      const res = await fetch("../api.php?route=users");
      const users = await res.json();
      const user = users.find((u) => (u.id || u._id) === id);

      if (user) {
        userEditId.value = user.id || user._id;
        userDisplayName.value = user.displayName;
        userUsername.value = user.username;
        userUsername.disabled = true; // No permitir cambiar username
        userRole.value = user.role;
        userPassword.placeholder = "Dejar vacío para no cambiar";
        userPassword.required = false;

        const permsElements = getPerms();
        Object.keys(permsElements).forEach((key) => {
          if (permsElements[key]) {
            permsElements[key].checked = user.permissions[key] || false;
          }
        });

        userSaveBtn.textContent = "Actualizar Usuario";
        userCancelBtn.classList.remove("hidden");
        userForm.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error("Error al cargar usuario para editar:", err);
    }
  }

  async function deleteUser(id) {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const res = await fetch(`../api.php?route=users/${id}`, { method: "DELETE" });
      if (res.ok) {
        window.showToast("Usuario eliminado");
        loadUsers();
      } else {
        const result = await res.json();
        window.showToast(result.message || "Error al eliminar", "error");
      }
    } catch (err) {
      window.showToast("Error de conexión", "error");
    }
  }

  function resetForm() {
    userEditId.value = "";
    userForm.reset();
    userUsername.disabled = false;
    userPassword.placeholder = "";
    userPassword.required = true;
    userSaveBtn.textContent = "Crear Usuario";
    userCancelBtn.classList.add("hidden");
  }

  return { init, editUser, deleteUser };
})();

window.UsersAdmin = UsersAdmin;
if (document.getElementById("usersSection")) UsersAdmin.init();

