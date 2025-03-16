const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(__dirname, "api_usage.json");

// Load existing counts or initialize if file doesn't exist
const loadCounts = () => {
    try {
        if (fs.existsSync(FILE_PATH)) {
            const data = fs.readFileSync(FILE_PATH, "utf8");
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Error reading file:", error);
    }
    return { youtube: 0, spotify: 0, jamendo: 0 };
};

// Save updated counts
const saveCounts = (counts) => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(counts, null, 2));
    } catch (error) {
        console.error("Error saving file:", error);
    }
};

// Update count for a service
const updateCount = (service) => {
    const counts = loadCounts();
    if (counts[service] !== undefined) {
        counts[service] += 1;
        saveCounts(counts);
        console.log(`✅ ${service} API called ${counts[service]} times`);
    } else {
        console.error("❌ Invalid service name:", service);
    }
};

// Export functions
module.exports = { updateCount, loadCounts };
