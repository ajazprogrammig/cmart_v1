package com.coe.BarcodeService;


import com.coe.Entity.Product;
import com.coe.ProductRepository.ProductRepository;
import com.coe.dto.ProductSaveRequest;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class BarcodeService {

    private final ProductRepository productRepository;

    public BarcodeService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public GeneratedBarcode generateBarcode(
            String productName,
            java.math.BigDecimal price1,
            java.math.BigDecimal price2) throws Exception {

        LocalDateTime now = LocalDateTime.now();

        String dateTime = now.format(
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
        );

        String barcodeId;

        do {
            int randomNumber =
                ThreadLocalRandom.current().nextInt(1, 1001);

            barcodeId = dateTime + randomNumber;

        } while (productRepository.existsByQrCode(barcodeId));

        String generatedAt = now.format(
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")
        );

        String barcodeData =
                "Barcode ID: " + barcodeId + "\n" +
                "Product Name: " + productName + "\n" +
                "Date Time: " + generatedAt + "\n" +
                "Price 1: " + price1 + "\n" +
                "Price 2: " + price2;

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 2);

        BitMatrix matrix = new MultiFormatWriter().encode(
                barcodeData,
                BarcodeFormat.QR_CODE,
                200,
                200,
                hints
        );

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        MatrixToImageWriter.writeToStream(
                matrix,
                "PNG",
                outputStream
        );

        return new GeneratedBarcode(
                outputStream.toByteArray(),
                barcodeId,
                generatedAt
        );
    }

    public Product saveProduct(ProductSaveRequest request) {

        if (request.getQrCode() == null ||
                request.getQrImageBase64() == null) {
            throw new IllegalArgumentException(
                "QR code and QR image are required"
            );
        }

        if (productRepository.existsByQrCode(request.getQrCode())) {
            throw new IllegalArgumentException(
                "This QR code is already saved"
            );
        }

        byte[] imageBytes = Base64.getDecoder().decode(
            request.getQrImageBase64()
        );

        Product product = new Product();

        product.setProductName(request.getProductName());
        product.setPrice1(request.getPrice1());
        product.setPrice2(request.getPrice2());

        product.setQrCode(request.getQrCode());
        product.setQrImage(imageBytes);

        product.setCreatedBy("Azaj");
        product.setCreatedDatetime(LocalDateTime.now());

        product.setUpdateBy(null);
        product.setUpdatedDatetime(null);

        product.setIsActive(1);
        product.setIsDeleted(0);

        return productRepository.save(product);
    }

    public static class GeneratedBarcode {

        private final byte[] image;
        private final String barcodeId;
        private final String generatedAt;

        public GeneratedBarcode(
                byte[] image,
                String barcodeId,
                String generatedAt) {

            this.image = image;
            this.barcodeId = barcodeId;
            this.generatedAt = generatedAt;
        }

        public byte[] getImage() { return image; }
        public String getBarcodeId() { return barcodeId; }
        public String getGeneratedAt() { return generatedAt; }
    }
}