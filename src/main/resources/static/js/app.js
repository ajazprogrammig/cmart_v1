let generatedProducts = [];

// Generate barcode
document.getElementById("barcodeForm")
.addEventListener("submit", async function (event) {

    event.preventDefault();

    const message = document.getElementById("message");
    const button = document.getElementById("generateBtn");

    button.disabled = true;
    if (message) {
        message.textContent = "Generating QR code...";
    }

    const requestData = {
        productName: document.getElementById("productName").value,
        price1: Number(document.getElementById("price1").value),
        price2: Number(document.getElementById("price2").value)
    };

    try {
        const response = await fetch("/api/barcode/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error("Barcode generation failed");
        }

        const blob = await response.blob();

        const barcodeId = response.headers.get("X-Barcode-ID");
        const generatedAt = response.headers.get("X-Generated-At");

        if (!barcodeId || !generatedAt) {
            throw new Error("Barcode ID or date is missing");
        }

        const base64Image = await blobToBase64(blob);
        const imageDataUrl = "data:image/png;base64," + base64Image;

        const product = {
            productName: requestData.productName,
            price1: requestData.price1,
            price2: requestData.price2,
            qrCode: barcodeId,
            generatedAt: generatedAt,
            imageUrl: imageDataUrl,
            qrImageBase64: base64Image,
            saved: false
        };

        generatedProducts.push(product);

        renderProducts();

        document.getElementById("result").style.display = "block";

        if (message) {
            message.textContent = "";
        }

        // Clear input for next product
        document.getElementById("barcodeForm").reset();

    } catch (error) {
        if (message) {
            message.textContent = error.message;
        } else {
            alert(error.message);
        }
    } finally {
        button.disabled = false;
    }
});

// Convert image blob to Base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Display generated products on main page
function renderProducts() {
    const barcodeList = document.getElementById("barcodeList");
    barcodeList.innerHTML = "";

    document.getElementById("productCount").textContent =
        "Total Products: " + generatedProducts.length;

    generatedProducts.forEach((product) => {
        const card = document.createElement("div");
        card.className = "barcode-card";

        const image = document.createElement("img");
        image.src = product.imageUrl;
        image.alt = "QR Code";

        const name = document.createElement("p");
        name.textContent = product.productName;

        const code = document.createElement("p");
        code.textContent = product.qrCode;

        const status = document.createElement("p");
        status.className = "saved-status";
        status.textContent = product.saved ? "Saved" : "Not Saved";

        card.append(image, name, code, status);
        barcodeList.appendChild(card);
    });
}

// Open A4 Print Sheet in a new tab with all QR codes & optional multiple copies
document.getElementById("printBtn")
.addEventListener("click", function () {

    if (generatedProducts.length === 0) {
        alert("Please generate at least one QR code");
        return;
    }

    const copiesInput = prompt(
        "Har QR code ki kitni copies A4 sheet par chahiye?",
        "1"
    );

    if (copiesInput === null) {
        return;
    }

    const copies = Math.max(1, parseInt(copiesInput, 10) || 1);

    const expandedProducts = [];
    generatedProducts.forEach(product => {
        for (let i = 0; i < copies; i++) {
            expandedProducts.push(product);
        }
    });

    const cardsHtml = expandedProducts.map(product => `
        <div class="print-card">
            <img src="data:image/png;base64,${product.qrImageBase64}" alt="${escapeHtml(product.productName)}">
            <h4>${escapeHtml(product.productName)}</h4>
            <p class="unique-code">${escapeHtml(product.qrCode)}</p>
            <p>${escapeHtml(product.generatedAt)}</p>
            <p>Price 1: ${product.price1}</p>
            <p>Price 2: ${product.price2}</p>
        </div>
    `).join("");

    const htmlDoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>A4 QR Print Sheet (${expandedProducts.length} Labels)</title>
            <style>
                @page { size: A4 portrait; margin: 10mm; }
                * { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; background: #f3f5f9; margin: 0; padding: 15px; }
                .toolbar {
                    max-width: 190mm;
                    margin: 0 auto 12px auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #fff;
                    padding: 10px 15px;
                    border-radius: 6px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                }
                .toolbar button {
                    padding: 8px 16px;
                    background: #1769e0;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .sheet {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8mm 5mm;
                    width: 190mm;
                    margin: 0 auto;
                    background: #fff;
                    padding: 8mm;
                }
                .print-card {
                    border: 1px solid #999;
                    padding: 4mm;
                    text-align: center;
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
                .print-card img {
                    width: 35mm;
                    height: 35mm;
                    object-fit: contain;
                    display: block;
                    margin: 0 auto 4px auto;
                }
                .print-card h4 { font-size: 10pt; margin: 3px 0; overflow-wrap: anywhere; }
                .print-card p { font-size: 8pt; margin: 2px 0; overflow-wrap: anywhere; }
                .print-card .unique-code { font-weight: bold; }
                @media print {
                    body { background: #fff; padding: 0; margin: 0; }
                    .toolbar { display: none !important; }
                    .sheet { padding: 0; width: 190mm; }
                }
            </style>
        </head>
        <body>
            <div class="toolbar">
                <span><strong>Total QR Labels:</strong> ${expandedProducts.length}</span>
                <button onclick="window.print()">Print A4 Sheet</button>
            </div>
            <div class="sheet">${cardsHtml}</div>
            <script>
                window.onload = function () {
                    setTimeout(() => window.print(), 300);
                };
            <\/script>
        </body>
        </html>
    `;

    const blob = new Blob([htmlDoc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
});

// Save all unsaved products to MySQL
document.getElementById("saveBtn")
.addEventListener("click", async function () {

    const saveButton = this;

    const unsavedProducts = generatedProducts.filter(
        product => !product.saved
    );

    if (unsavedProducts.length === 0) {
        alert("No new products to save");
        return;
    }

    saveButton.disabled = true;

    const saveMessage = document.getElementById("saveMessage");
    let successCount = 0;
    let failedCount = 0;

    try {
        for (const product of unsavedProducts) {
            try {
                const requestData = {
                    productName: product.productName,
                    price1: product.price1,
                    price2: product.price2,
                    qrCode: product.qrCode,
                    qrImageBase64: product.qrImageBase64
                };

                const response = await fetch("/api/barcode/save", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    throw new Error("Database save failed");
                }

                const savedData = await response.json();
                product.saved = true;
                product.productId = savedData.productId;
                successCount++;

            } catch (error) {
                failedCount++;
            }
        }

        renderProducts();

        saveMessage.textContent =
            "Saved: " + successCount +
            " | Failed: " + failedCount;

    } finally {
        saveButton.disabled = false;
    }
});

// Download latest QR image
document.getElementById("downloadBtn")
.addEventListener("click", function () {

    if (generatedProducts.length === 0) {
        alert("Generate a QR code first");
        return;
    }

    const product = generatedProducts[generatedProducts.length - 1];
    const link = document.createElement("a");
    link.href = product.imageUrl;
    link.download = product.qrCode + ".png";
    link.click();
});

// Escape HTML special characters
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}