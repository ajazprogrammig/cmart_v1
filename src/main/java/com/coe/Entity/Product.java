package com.coe.Entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Lob
    @Column(name = "qr_image", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] qrImage;

    @Column(name = "qr_code", nullable = false, unique = true)
    private String qrCode;

    @Column(name = "price_1", nullable = false)
    private BigDecimal price1;

    @Column(name = "price_2", nullable = false)
    private BigDecimal price2;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_datetime")
    private LocalDateTime createdDatetime;

    @Column(name = "update_by")
    private String updateBy;

    @Column(name = "updated_datetime")
    private LocalDateTime updatedDatetime;

    @Column(name = "is_active")
    private Integer isActive;

    @Column(name = "is_deleted")
    private Integer isDeleted;

    // Generate getters and setters using your IDE.
    // IntelliJ: Alt + Insert -> Getter and Setter
    // Eclipse: Source -> Generate Getters and Setters

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public byte[] getQrImage() { return qrImage; }
    public void setQrImage(byte[] qrImage) { this.qrImage = qrImage; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public BigDecimal getPrice1() { return price1; }
    public void setPrice1(BigDecimal price1) { this.price1 = price1; }

    public BigDecimal getPrice2() { return price2; }
    public void setPrice2(BigDecimal price2) { this.price2 = price2; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedDatetime() { return createdDatetime; }
    public void setCreatedDatetime(LocalDateTime createdDatetime) {
        this.createdDatetime = createdDatetime;
    }

    public String getUpdateBy() { return updateBy; }
    public void setUpdateBy(String updateBy) { this.updateBy = updateBy; }

    public LocalDateTime getUpdatedDatetime() { return updatedDatetime; }
    public void setUpdatedDatetime(LocalDateTime updatedDatetime) {
        this.updatedDatetime = updatedDatetime;
    }

    public Integer getIsActive() { return isActive; }
    public void setIsActive(Integer isActive) { this.isActive = isActive; }

    public Integer getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Integer isDeleted) { this.isDeleted = isDeleted; }
}