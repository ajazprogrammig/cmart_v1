package com.coe.BarcodeController;

import com.coe.BarcodeRequest.BarcodeRequest;
import com.coe.BarcodeService.BarcodeService;
import com.coe.BarcodeService.BarcodeService.GeneratedBarcode;
import com.coe.Entity.Product;
import com.coe.dto.ProductSaveRequest;

import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class BarcodeController {

    private final BarcodeService barcodeService;

    public BarcodeController(BarcodeService barcodeService) {
        this.barcodeService = barcodeService;
    }

    @PostMapping(value = "/api/barcode/generate", produces = MediaType.IMAGE_PNG_VALUE)
    @ResponseBody
    public ResponseEntity<byte[]> generateBarcode(@RequestBody BarcodeRequest request) throws Exception {

        GeneratedBarcode generated = barcodeService.generateBarcode(
                request.getProductName(),
                request.getPrice1(),
                request.getPrice2()
        );

        return ResponseEntity.ok()
                .header("X-Barcode-ID", generated.getBarcodeId())
                .header("X-Generated-At", generated.getGeneratedAt())
                .contentType(MediaType.IMAGE_PNG)
                .body(generated.getImage());
    }

    @PostMapping("/api/barcode/save")
    @ResponseBody
    public ResponseEntity<Product> saveProduct(@RequestBody ProductSaveRequest request) {

        Product savedProduct = barcodeService.saveProduct(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/print-sheet")
    public String printSheet() {
        return "print-sheet";
    }
}