package com.project.erpre.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import javax.persistence.Column;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private String productCd;
    private String productNm;
    private String categoryNm;
    private LocalDateTime productInsertDate;
    private LocalDateTime productUpdateDate;
    private String employeeName;
    private Date orderDDeliveryRequestDate;
    private Integer orderDQty;
    private BigDecimal orderDTotalPrice;
    private BigDecimal orderDPrice;
    private String customerName;
    private Integer categoryNo;
    private Integer topCategoryNo;    // Top-level category ID
    private Integer middleCategoryNo; // Mid-level category ID
    private Integer lowCategoryNo;    // Low-level category ID
    private String topCategory;       // Top-level category name
    private String middleCategory;    // Mid-level category name
    private String lowCategory;       // Low-level category name
    private String productDeleteYn;   // Deletion status, default 'N'
    private Timestamp productDeleteDate; // Deletion timestamp
    private BigDecimal productPrice;      // Product price
    private BigDecimal priceCustomer;     // Customer-specific product price

    // 1. Constructor for retrieving the entire product list
    public ProductDTO(String productCd, String productNm, LocalDateTime productInsertDate, LocalDateTime productUpdateDate,
                      Timestamp productDeleteDate, String productDeleteYn,
                      String lowCategory, String middleCategory, String topCategory,
                      Integer lowCategoryNo, Integer middleCategoryNo, Integer topCategoryNo,
                      BigDecimal productPrice, BigDecimal priceCustomer) {
        this.productCd = productCd;
        this.productNm = productNm;
        this.productInsertDate = productInsertDate;
        this.productUpdateDate = productUpdateDate;
        this.productDeleteDate = productDeleteDate;
        this.productDeleteYn = productDeleteYn;
        this.lowCategory = lowCategory;
        this.middleCategory = middleCategory;
        this.topCategory = topCategory;
        this.lowCategoryNo = lowCategoryNo;
        this.middleCategoryNo = middleCategoryNo;
        this.topCategoryNo = topCategoryNo;
        this.productPrice = productPrice;
        this.priceCustomer = priceCustomer;
    }

    // 2. Constructor for retrieving product detail information
    public ProductDTO(String productCd, String productNm, LocalDateTime productInsertDate, LocalDateTime productUpdateDate,
                      String employeeName, String customerName, Date orderDDeliveryRequestDate, Integer orderDQty,
                      BigDecimal orderDTotalPrice, String topCategory, String middleCategory, String lowCategory,
                      BigDecimal productPrice, BigDecimal orderDPrice) {
        this.productCd = productCd;
        this.productNm = productNm;
        this.productInsertDate = productInsertDate;
        this.productUpdateDate = productUpdateDate;
        this.employeeName = employeeName;
        this.customerName = customerName;
        this.orderDDeliveryRequestDate = orderDDeliveryRequestDate;
        this.orderDQty = orderDQty;
        this.orderDTotalPrice = orderDTotalPrice;
        this.topCategory = topCategory;
        this.middleCategory = middleCategory;
        this.lowCategory = lowCategory;
        this.productPrice = productPrice;
        this.orderDPrice = orderDPrice;
    }

    // 3. Constructor for product creation and update
    public ProductDTO(String productCd, String productNm, Integer categoryNo, BigDecimal productPrice) {
        this.productCd = productCd;
        this.productNm = productNm;
        this.categoryNo = categoryNo;
        this.productPrice = productPrice;
    }
}
