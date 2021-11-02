insert into t_product (sku) values ('TESTSKU');
-- generates the product id for use below...
set @productid = 4508;

insert into t_product_certificate (product_id, certificate_id ) values
( @productid, 1),
( @productid, 2);

insert into t_product_custom_attribute (product_id, custom_attribute_id, value_en) values 
( @productid, 1, 'test value');

insert into t_product_equipment_connect (product_id, equipment_id) values 
( @productid, 11 ),
( @productid, 11 );

insert into t_product_family_connect (product_id, family_id) values 
( @productid, 6 ),
( @productid, 7 );

insert into t_product_filter_option (product_id, filter_option_id) values 
( @productid, 52 ),
( @productid, 54 );

insert into t_product_image (product_id, image_type_id, image_link) values 
( @productid, 2, 'https://test.domain.com/image/test1.jpg' ),
( @productid, 2, 'https://test.domain.com/image/test2.jpg' );

insert into t_product_marketing_region (product_id, marketing_region_id) values 
( @productid, 1);

insert into t_product_oem_reference (product_id, brand_id, name, is_oem) values 
( @productid, 3, 'MTEST', 1),
( @productid, 37, 'STEST', 0),
( @productid, 39, 'UTEST', 1),
( @productid, 40, 'NSTEST', 0);

insert into t_product_supplier (product_id, supplier_id, supplier_price) values 
( @productid, 1, 42.00),
( @productid, 2, 43.00); 


