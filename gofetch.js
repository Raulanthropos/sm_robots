import fs from "fs";
import axios from "axios";
import { JSDOM } from "jsdom";

async function scrapeWebsite(url) {
  try {
    console.log("Fetching product page...");
    const { data: html } = await axios.get(url);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // ✅ Extract Product Details
    const productName = document.querySelector(".product-main-info .product-name")?.textContent.trim() || "N/A";
    const productPrice = document.querySelector("#finalPrice")?.textContent.trim() || "N/A";
    const productImage =
      document.querySelector(".product-main-carousel img")?.src ||
      document.querySelector(".product-main-carousel-nav img")?.src ||
      "N/A";

    // ✅ Additional Details
    const productCode =
      document.querySelector(".product-code")?.textContent.replace("Κωδικός Προϊόντος:", "").trim() || "N/A";
    const weight = document.querySelector(".p-weight-price span")?.textContent.trim() || "N/A";
    const pricePerKilo = document.querySelector("#ssfield4 span")?.textContent.trim() || "N/A";

    // ✅ Extract Description (if available)
    const productDescription = document.querySelector(".product-description-short")?.textContent.trim() || "N/A";

    // ✅ Extract Ingredients (if available)
    const ingredientsText = document.querySelector(".ingredients p")?.textContent.trim() || "N/A";

    // ✅ Extract Nutritional Values
    const nutritionalInfo = document.querySelector(".nutritional-details")?.textContent.trim() || "N/A";

    // ✅ Build JSON Output
    const productData = {
      name: productName,
      price: productPrice,
      price_per_kilo: pricePerKilo,
      weight: weight,
      product_code: productCode,
      description: productDescription,
      ingredients: ingredientsText,
      nutritional_info: nutritionalInfo,
      image: productImage.startsWith("http") ? productImage : `https://www.market-in.gr${productImage}`,
      url: url
    };

    console.log("Scraped Data:", productData);

    // ✅ Save to JSON file
    fs.writeFileSync("scrapedData.json", JSON.stringify(productData, null, 2), "utf-8");
    console.log("✅ Data has been written to scrapedData.json");

  } catch (error) {
    console.error("❌ Error fetching the page:", error);
  }
}

// Run the scraper
scrapeWebsite("https://www.market-in.gr/el-gr/katepsugmena-katapsuksh-katepsugmena-kreatika/mikres-farmes-tou-vounou-mpiftekakia-paradosiaka-spitika-500-gr-");
