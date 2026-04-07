const fs = require("fs");
const path = require("path");

const agendaPath = path.join(__dirname, "../../header_menu/cas/agenda.html");

const AgendaModel = {
  getAll: () => {
    if (!fs.existsSync(agendaPath)) return [];
    const content = fs.readFileSync(agendaPath, "utf8");
    const items = [];
    const regex =
      /<div [^>]*class="card"[^>]*data-id="(\d+)"[^>]*>[\s\S]*?<h4>([\s\S]*?)<\/h4>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      items.push({
        id: match[1],
        title: match[2].trim(),
        time: match[3].trim(),
      });
    }
    return items;
  },

  create: (title, time) => {
    const activityId = Date.now();
    const activityHtml = `
                    <!-- Actividad Automatizada -->
                    <div class="card" style="border-left: 5px solid var(--primary); margin-bottom: 1rem;" data-id="${activityId}">
                        <h4>${title}</h4>
                        <p style="font-size: 0.85rem;">${time}</p>
                    </div>`;

    if (fs.existsSync(agendaPath)) {
      let content = fs.readFileSync(agendaPath, "utf8");
      const markerRegex = /<div [^>]*id="agenda-items-container"[^>]*>/;
      if (markerRegex.test(content)) {
        content = content.replace(markerRegex, (match) => match + activityHtml);
        fs.writeFileSync(agendaPath, content);
      }
    }
    return activityId;
  },

  delete: (id) => {
    if (fs.existsSync(agendaPath)) {
      let content = fs.readFileSync(agendaPath, "utf8");
      const regex = new RegExp(
        `<!-- Actividad Automatizada -->\\s*<div class="card" style="[^"]*" data-id="${id}">[\\s\\S]*?</div>`,
        "g",
      );
      content = content.replace(regex, "");
      fs.writeFileSync(agendaPath, content);
    }
    return true;
  },
};

module.exports = AgendaModel;
