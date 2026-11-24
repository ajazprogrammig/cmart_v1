package com.coe.dto;

import java.math.BigDecimal;

public class ProductSaveRequest {

    private String productName;
    private BigDecimal price1;
    private BigDecimal price2;
    private String qrCode;
    private String qrImageBase64;

    public String getProductName() { return productName; }
    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getPrice1() { return price1; }
    public void setPrice1(BigDecimal price1) {
        this.price1 = price1;
    }

    public BigDecimal getPrice2() { return price2; }
    public void setPrice2(BigDecimal price2) {
        this.price2 = price2;
    }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public String getQrImageBase64() { return qrImageBase64; }
    public void setQrImageBase64(String qrImageBase64) {
        this.qrImageBase64 = qrImageBase64;
    }
}
