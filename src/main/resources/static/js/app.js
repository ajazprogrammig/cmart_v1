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

// Open A4 Print Sheet in a new tab
document.getElementById("printBtn")
.addEventListener("click", function () {

    if (generatedProducts.length === 0) {
        alert("Please generate at least one QR code");
        return;
    }

    // Use localStorage so the new tab reliably receives all products
    localStorage.setItem(
        "printProducts",
        JSON.stringify(generatedProducts)
    );

    window.open("/print-sheet", "_blank");
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