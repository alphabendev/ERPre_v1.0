package com.project.erpre.controller;

import com.project.erpre.model.CategoryDTO;
import com.project.erpre.model.ProductDTO;
import com.project.erpre.service.CategoryService;
import com.project.erpre.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:8787") // React development server port
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    // 1. Product list 조회 + filtering + sorting + paging API
    @GetMapping("/productList")
    public ResponseEntity<Page<ProductDTO>> getProductsAndCategories(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "all", required = false) String status,
            @RequestParam(required = false) Integer topCategoryNo,
            @RequestParam(required = false) Integer middleCategoryNo,
            @RequestParam(required = false) Integer lowCategoryNo,
            @RequestParam(required = false) String productCd,
            @RequestParam(required = false) String productNm,
            @RequestParam(required = false, defaultValue = "productCd") String sortColumn,
            @RequestParam(required = false, defaultValue = "asc") String sortDirection
    ) {
        try {
            Page<ProductDTO> result = productService.getProductsList(
                    page - 1, size, status,
                    topCategoryNo, middleCategoryNo, lowCategoryNo,
                    productCd, productNm, sortColumn, sortDirection
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 🔴 0920 Yewon added
    // (Retrieve product list with paging by product code, product name,
    // top/middle/low category, and status)
    @GetMapping("/productsFilter")
    public ResponseEntity<Page<ProductDTO>> getProductsFilter(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer topCategoryNo,     // Top category filter
            @RequestParam(required = false) Integer middleCategoryNo,  // Middle category filter
            @RequestParam(required = false) Integer lowCategoryNo,     // Low category filter
            @RequestParam(defaultValue = "all", required = false) String status,
            @RequestParam(required = false) String productCd,          // Product code filter
            @RequestParam(required = false) String productNm,          // Product name filter
            @RequestParam(required = false) Integer customerNo         // Customer selected when registering an order
    ) {
        try {
            logger.info("🔴 customerNo : " + customerNo);
            Page<ProductDTO> result = productService.getProductsFilter(
                    page - 1, size, status,
                    topCategoryNo, middleCategoryNo, lowCategoryNo,
                    productCd, productNm, customerNo
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 2. Product detail 조회 API (includes last 5 delivery records)
    @GetMapping("/productDetail/{productCd}")
    public ResponseEntity<List<ProductDTO>> getProductDetailsByProductCd(@PathVariable String productCd) {
        try {
            List<ProductDTO> productDetails = productService.getProductDetailsByProductCd(productCd);
            if (productDetails.isEmpty()) {
                // Return 404 Not Found if no data exists
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            // Return 200 OK if data is found
            return ResponseEntity.ok(productDetails);
        } catch (Exception e) {
            // Return 500 Internal Server Error if an exception occurs
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 3. Product registration API
    @PostMapping("/add")
    public ResponseEntity<ProductDTO> addProduct(@RequestBody ProductDTO productDTO) {
        try {
            ProductDTO savedProduct = productService.addProduct(productDTO);
            return ResponseEntity.ok(savedProduct);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 4. Product update API
    @PutMapping("/update")
    public ResponseEntity<ProductDTO> updateProduct(@RequestBody ProductDTO productDTO) {
        ProductDTO updatedProduct = productService.updateProduct(productDTO);
        return ResponseEntity.ok(updatedProduct);
    }

    // 5. Delete selected products API
    @PostMapping("/delete")
    public ResponseEntity<Void> deleteProducts(@RequestBody List<String> productCds) {
        if (productCds == null || productCds.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        try {
            productService.deleteProducts(productCds);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();  // Invalid request
        } catch (Exception e) {
            e.printStackTrace();  // Log error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 6. Restore selected products API
    @PutMapping("/restore")
    public ResponseEntity<Void> restoreProducts(@RequestBody List<String> productCds) {
        try {
            productService.restoreProducts(productCds);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 7. Category retrieval API
    @GetMapping("/category")
    public ResponseEntity<List<CategoryDTO>> getCategoryList(
            @RequestParam(required = false) Integer topCategoryNo,
            @RequestParam(required = false) Integer middleCategoryNo,
            @RequestParam(required = false) Integer lowCategoryNo
    ) {
        try {
            List<CategoryDTO> categories = productService.getCategoryList(
                    topCategoryNo, middleCategoryNo, lowCategoryNo
            );

            if (categories.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/productCounts")
    public ResponseEntity<Map<String, Long>> getProductCounts() {
        try {
            long totalProductCount = productService.getTotalProductCount();
            long recentProductCount = productService.getRecentProductCount();

            Map<String, Long> productCounts = new HashMap<>();
            productCounts.put("totalProductCount", totalProductCount);
            productCounts.put("recentProductCount", recentProductCount);

            return ResponseEntity.ok(productCounts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
