const fs = require("fs");
const filePath = "apiUsage.json";

// Initialize file if missing
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ youtube: 0, spotify: 0, jamendo: 0 }));
}

// Update API count
const updateAPIUsage = (source) => {
    const data = JSON.parse(fs.readFileSync(filePath));
    data[source] = (data[source] || 0) + 1;
    fs.writeFileSync(filePath, JSON.stringify(data));
};

module.exports = { updateAPIUsage };
