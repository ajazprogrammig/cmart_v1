package com.coe.ProductRepository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.coe.Entity.Product;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    boolean existsByQrCode(String qrCode);
}
