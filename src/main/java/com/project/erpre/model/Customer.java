package com.project.erpre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "m_customer")
@Data // @Data includes @Getter, @Setter, @ToString, @EqualsAndHashCode, etc.
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_no")
    private Integer customerNo;

    @Column(name = "customer_name", length = 100, nullable = false)
    private String customerName;

    @Column(name = "customer_tel", length = 20)
    private String customerTel;

    @Column(name = "customer_representative_name", length = 50)
    private String customerRepresentativeName;

    @Column(name = "customer_business_reg_no", length = 20, nullable = false)
    private String customerBusinessRegNo;

    @Column(name = "customer_addr", length = 200)
    private String customerAddr;

    @Column(name = "customer_fax_no", length = 20)
    private String customerFaxNo;

    @Column(name = "customer_manager_name", length = 20)
    private String customerManagerName;

    @Column(name = "customer_manager_email", length = 50)
    private String customerManagerEmail;

    @Column(name = "customer_manager_tel", length = 20)
    private String customerManagerTel;

    @Column(name = "customer_country_code", length = 20)
    private String customerCountryCode;

    @Column(name = "customer_type", length = 20)
    private String customerType;

    @Column(name = "customer_e_tax_invoice_yn", length = 20)
    private String customerEtaxInvoiceYn;

    @Column(name = "customer_transaction_start_date")
    private Timestamp customerTransactionStartDate;

    @Column(name = "customer_transaction_end_date")
    private Timestamp customerTransactionEndDate;

    @Column(name = "customer_insert_date", insertable = false, nullable = false)
    private Timestamp customerInsertDate;

    @Column(name = "customer_update_date")
    private Timestamp customerUpdateDate;

    @Column(name = "customer_delete_yn", length = 20, nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'N'")
    private String customerDeleteYn; // Default value 'N' indicates deletion status

    @Column(name = "customer_delete_date")
    private Timestamp customerDeleteDate; // Deletion timestamp

    @ToString.Exclude
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    // Prevent circular reference (infinite recursive call - stack overflow solution)
    // -> Completely exclude this field from serialization/deserialization.
    // Used when you want to completely ignore a field during serialization.
    private List<Order> orderHeads;

    @ToString.Exclude
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Price> prices = new ArrayList<>();  // Initialized as an empty list
}
