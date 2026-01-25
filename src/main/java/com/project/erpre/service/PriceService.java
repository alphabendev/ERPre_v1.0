package com.project.erpre.service;

import com.project.erpre.model.Price;
import com.project.erpre.model.PriceDTO;
import com.project.erpre.repository.CustomerRepository;
import com.project.erpre.repository.PriceRepository;
import com.project.erpre.repository.ProductRepository;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.sql.Timestamp;

@Service
@Log4j2
public class PriceService {

    private static final Logger logger = LoggerFactory.getLogger(PriceService.class); // Declare logger

    @Autowired
    private PriceRepository priceRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ModelMapper modelMapper;  // Inject ModelMapper object

    // Entity -> DTO conversion (without using ModelMapper library)
    public PriceDTO convertToDTO(Price price) {
        PriceDTO dto = new PriceDTO();
        // Manual field mapping
        dto.setPriceNo(price.getPriceNo());
        dto.setPriceCustomer(price.getPriceCustomer());
        dto.setPriceStartDate(price.getPriceStartDate());
        dto.setPriceEndDate(price.getPriceEndDate());
        dto.setCustomerNo(price.getCustomer().getCustomerNo());
        dto.setProductCd(price.getProduct().getProductCd());
        dto.setCustomerName(price.getCustomer().getCustomerName());
        dto.setProductNm(price.getProduct().getProductNm());
        dto.setCategoryNm(price.getProduct().getCategory().getCategoryNm());
        dto.setCategoryPath(price.getProduct().getCategory().getCategoryPath());
        dto.setPriceInsertDate(price.getPriceInsertDate());
        dto.setPriceUpdateDate(price.getPriceUpdateDate());
        dto.setPriceDeleteYn(price.getPriceDeleteYn());
        dto.setPriceDeleteDate(price.getPriceDeleteDate());

        return dto;
    }

    // DTO -> Entity conversion (without using ModelMapper library)
    public Price convertToEntity(PriceDTO priceDTO) {
        Price price = new Price();
        price.setPriceNo(priceDTO.getPriceNo());
        price.setPriceCustomer(priceDTO.getPriceCustomer());
        price.setPriceStartDate(priceDTO.getPriceStartDate());
        price.setPriceEndDate(priceDTO.getPriceEndDate());
        price.setPriceDeleteYn(priceDTO.getPriceDeleteYn());
        price.setPriceInsertDate(priceDTO.getPriceInsertDate());
        price.setPriceUpdateDate(priceDTO.getPriceUpdateDate());
        price.setPriceDeleteDate(priceDTO.getPriceDeleteDate());

        // Manually map associated entities
        price.setCustomer(customerRepository.findById(priceDTO.getCustomerNo())
                .orElseThrow(() -> new RuntimeException("Customer not found: " + priceDTO.getCustomerNo())));
        price.setProduct(productRepository.findById(priceDTO.getProductCd())
                .orElseThrow(() -> new RuntimeException("Product not found: " + priceDTO.getProductCd())));

        return price;
    }

    // 🟢 Save or update price information (handles multiple PriceDTOs)
    public List<PriceDTO> saveOrUpdate(List<PriceDTO> priceDTOs) {
        // Log the list of PriceDTOs
        logger.info("[1] 🟢 Received PriceDTO List for saving or updating: {}", priceDTOs);

        // Convert each PriceDTO to entity and save
        List<PriceDTO> savedPriceDTOs = priceDTOs.stream().map(priceDTO -> {
            logger.info("🟢 Saving or updating price: {}", priceDTO); // Log each PriceDTO
            Price price = convertToEntity(priceDTO); // DTO -> Entity conversion

            // If priceNo exists (update mode), set update timestamp to now
            if (price.getPriceNo() != null) {
                price.setPriceUpdateDate(new Timestamp(System.currentTimeMillis())); // Update timestamp for edit
            }

            Price savedPrice = priceRepository.save(price); // Save entity
            return convertToDTO(savedPrice); // Return DTO after saving
        }).collect(Collectors.toList());

        return savedPriceDTOs; // Return list of saved PriceDTOs
    }

    // 🟢 Update deletion/restoration status of price information
    public List<Price> updatePriceDeleteYn(List<PriceDTO> priceDTOs) {
        List<Price> updatedPrices = new ArrayList<>();

        // Process each PriceDTO
        for (PriceDTO priceDTO : priceDTOs) {
            // Find existing Price entity by priceNo
            Price price = priceRepository.findById(priceDTO.getPriceNo())
                    .orElseThrow(() -> new RuntimeException("Price information not found: " + priceDTO.getPriceNo()));

            // Handle delete/restore logic
            if ("Y".equals(priceDTO.getPriceDeleteYn())) {
                price.setPriceDeleteYn("Y");
                price.setPriceDeleteDate(new Timestamp(System.currentTimeMillis()));  // Update delete timestamp
            } else if ("N".equals(priceDTO.getPriceDeleteYn())) {
                price.setPriceDeleteYn("N");
                price.setPriceDeleteDate(null);  // Set delete timestamp to null
                price.setPriceUpdateDate(new Timestamp(System.currentTimeMillis())); // Update timestamp
            }

            // Save updated entity
            updatedPrices.add(priceRepository.save(price));
        }

        return updatedPrices; // Return list of updated Price entities
    }

    // 🟣 Delete price
    public void deletePrice(Integer priceNo) {
        logger.info("[3] Deleting price with ID: " + priceNo);
        priceRepository.deleteById(priceNo);
    }

    // 🔴 Retrieve price information for specific customer and product
    public List<PriceDTO> getPricesByCustomerAndProduct(Integer customerNo, String productCd) {
        List<Price> prices = priceRepository.findByCustomer_CustomerNoAndProduct_ProductCd(customerNo, productCd);
        return prices.stream()
                .map(this::convertToDTO)  // Convert Price -> PriceDTO
                .collect(Collectors.toList());
    }

    // 🟢 Check for duplicate price information
    public List<PriceDTO> checkDuplicate(PriceDTO priceDTO) {
        logger.info("🟢 Checking for duplicate price for customerNo: {}, productCd: {}, priceStartDate: {}, priceEndDate: {}",
                priceDTO.getCustomerNo(), priceDTO.getProductCd(), priceDTO.getPriceStartDate(), priceDTO.getPriceEndDate());

        // Find overlapping price entries
        List<Price> overlappingPrices = priceRepository.findOverlappingPrices(
                priceDTO.getCustomerNo(),
                priceDTO.getProductCd(),
                priceDTO.getPriceStartDate(),
                priceDTO.getPriceEndDate());

        // Convert Price entities to PriceDTO and return
        return overlappingPrices.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 🔴 Filter + pagination + sorting (convert Price entities to PriceDTO)
    public Page<PriceDTO> getAllPrices(Integer customerNo, String productCd, String startDate, String endDate, String targetDate, String customerSearchText, String productSearchText, String selectedStatus, PageRequest pageRequest) {
        logger.info("🟢 Fetching all prices with filters");

        // If any filter condition exists, fetch filtered prices
        if (customerNo != null || productCd != null || startDate != null || endDate != null || customerSearchText != null || productSearchText != null || selectedStatus != null) {
            // Retrieve filtered data from repository
            Page<Price> prices = priceRepository.findPricesWithFilters(customerNo, productCd, startDate, endDate, targetDate, customerSearchText, productSearchText, selectedStatus, pageRequest);
            return prices.map(this::convertToDTO); // Convert entities to DTOs
        }

        // If no filters, fetch all prices
        Page<Price> allPrices = priceRepository.findAll(pageRequest);
        return allPrices.map(this::convertToDTO); // Convert entities to DTOs
    }

}
