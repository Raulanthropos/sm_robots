import fs from "fs";
import axios from "axios";

// Load existing robots.json
const filePath = "./robots.json";
const robotsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

const supermarketList = {
  "My Market": "https://www.mymarket.gr/robots.txt",
  "Masoutis": "https://www.masoutis.gr/robots.txt",
  "Market In": "https://www.market-in.gr/robots.txt"
};

async function updateRobotsData() {
  const today = new Date().toLocaleDateString("el-GR").replace(/\//g, "-"); // Converts to DD-MM-YYYY

  for (const [name, robotsURL] of Object.entries(supermarketList)) {
    try {
      console.log(`🔍 Checking: ${name}...`);

      const response = await axios.get(robotsURL);
      const robotsTxt = response.data;

      const disallowedPaths = robotsTxt.match(/Disallow:\s*(.*)/g)?.map(line => line.replace("Disallow: ", "").trim()) || [];

      const sitemaps = robotsTxt.match(/Sitemap:\s*(.*)/g)?.map(line => line.replace("Sitemap: ", "").trim()) || [];

      if (!robotsData.supermarkets[name]) {
        console.log(`🆕 New supermarket detected: ${name} -> Adding to JSON.`);
        robotsData.supermarkets[name] = {
          "rules": {
            "allows_search": !disallowedPaths.includes("/search"),
            "allows_product_pages": true,
            "allows_category_pages": true,
            "allows_filtering": !disallowedPaths.some(path => path.includes("orderby") || path.includes("filter")),
            "disallowed_paths": disallowedPaths
          },
          "sitemaps": sitemaps,
          "last_checked": today
        };
      } else {
        robotsData.supermarkets[name].last_checked = today;
        console.log(`✅ Updated: ${name} -> ${today}`);
      }

    } catch (error) {
      console.error(`❌ Error fetching ${name}:`, error.message);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(robotsData, null, 2), "utf-8");
  console.log("\n🚀 robots.json successfully updated!");
}

updateRobotsData();
