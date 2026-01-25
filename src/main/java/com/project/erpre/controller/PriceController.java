package com.project.erpre.controller;

import com.project.erpre.model.Price;
import com.project.erpre.model.PriceDTO;
import com.project.erpre.service.PriceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/price")
public class PriceController {

    private static final Logger logger = LoggerFactory.getLogger(PriceController.class); // Logger declaration

    @Autowired
    private PriceService priceService;

    // 🟢 Insert price information
    @PostMapping("/insert")
    public List<PriceDTO> insertPrice(@RequestBody List<PriceDTO> priceDTOs) {
        logger.info("🟢 insertPrice : Received PriceDTO List: {}", priceDTOs);  // Log the PriceDTO list itself
        return priceService.saveOrUpdate(priceDTOs);
    }

    // 🟢 Update price information
    @PutMapping("/update")
    public List<PriceDTO> updatePrice(@RequestBody List<PriceDTO> priceDTOs) {
        logger.info("🟢 updatePrice : Received PriceDTO List: {}", priceDTOs);  // Log the PriceDTO list itself
        return priceService.saveOrUpdate(priceDTOs);
    }

    // 🟢 Delete and restore price information
    @PutMapping("/updateDel")
    public ResponseEntity<List<Price>> updatePriceDeleteYn(@RequestBody List<PriceDTO> priceDTOs) {
        logger.info("🟢 Received PriceDTO List: {}", priceDTOs);  // Log PriceDTO list
        List<Price> updatedPrices = priceService.updatePriceDeleteYn(priceDTOs);
        return ResponseEntity.ok(updatedPrices);  // Return updated Price list
    }

    // [3] 🟣 Delete a specific price record
    @DeleteMapping("/delete/{id}")
    public void deletePrice(@PathVariable("id") Integer priceNo) {
        logger.info("Deleting price with ID: {}", priceNo);
        priceService.deletePrice(priceNo);
    }

    // 🔴 Retrieve price information for a specific customer and product
    @GetMapping("/customer-product")
    public List<PriceDTO> getPricesByCustomerAndProduct(
            @RequestParam("customerNo") Integer customerNo,
            @RequestParam("productCd") String productCd
    ) {
        logger.info("Fetching prices for customer {} and product {}", customerNo, productCd);
        return priceService.getPricesByCustomerAndProduct(customerNo, productCd);
    }

    // 🔴 API to check whether price start and end dates overlap
    @PostMapping("/check-duplicate")
    public ResponseEntity<List<PriceDTO>> checkDuplicatePrice(@RequestBody PriceDTO priceDTO) {
        logger.info("🟢 Received PriceDTO: {}", priceDTO);  // Log PriceDTO

        // Check for overlapping data in the service
        List<PriceDTO> duplicatePrices = priceService.checkDuplicate(priceDTO);

        // Return duplicate price information (empty list if none)
        return ResponseEntity.ok(duplicatePrices);
    }

    // 🔴 Retrieve price information list (supports filtering, paging, and sorting)
    @GetMapping("/all")
    public Page<PriceDTO> getAllPrices(
            @RequestParam(required = false) Integer customerNo,  // Customer number filter
            @RequestParam(required = false) String productCd,    // Product code filter
            @RequestParam(required = false) String startDate,    // Start date filter
            @RequestParam(required = false) String endDate,      // End date filter
            @RequestParam(required = false) String targetDate,   // Target application date
            @RequestParam(required = false) String customerSearchText,   // Search text (customer name)
            @RequestParam(required = false) String productSearchText,    // Search text (product name or product code)
            @RequestParam(required = false) String selectedStatus, // Status filter (all / active N / deleted Y)
            @RequestParam(defaultValue = "1") int page,          // Page number (default: 1)
            @RequestParam(defaultValue = "10") int size,         // Items per page (default: 10)
            @RequestParam(defaultValue = "priceNo") String sort, // Sort field (default: priceNo)
            @RequestParam(defaultValue = "asc") String order     // Sort order (default: asc)
    ) {
        logger.info("Fetching all prices with filters");
        Sort.Direction direction = order.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        return priceService.getAllPrices(
                customerNo,
                productCd,
                startDate,
                endDate,
                targetDate,
                customerSearchText,
                productSearchText,
                selectedStatus,
                pageRequest
        );
    }
}
