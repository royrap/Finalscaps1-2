    # 📊 Database Tables ACTIVELY USED in Auto-Repair System

    **Generated:** October 3, 2025  
    **Analysis:** Based on actual code queries in the system

    ---

    ## ✅ **CORE TABLES (Heavily Used)**

    These tables are essential and actively queried throughout the system:

    ### 1️⃣ **user_profiles** ⭐⭐⭐⭐⭐
    **Usage:** CRITICAL - Used in 40+ queries
    - Admin dashboard (user management)
    - Admin pages (users, analytics, payments)
    - Service requests (customer & mechanic info)
    - Authentication & login
    - Profile management
    - User status tracking

    **Key Columns Used:**
    - `id`, `first_name`, `last_name`, `email`, `phone_number`
    - `user_type` (customer, mechanic, talyer_owner, admin)
    - `status`, `profile_image_url`, `rating`
    - `current_latitude`, `current_longitude`

    ---

    ### 2️⃣ **service_requests** ⭐⭐⭐⭐⭐
    **Usage:** CRITICAL - Used in 25+ queries
    - Admin requests page
    - Admin dashboard
    - Analytics/reports
    - Payment creation
    - Service tracking

    **Key Columns Used:**
    - `id`, `title`, `description`, `status`
    - `customer_id`, `provider_id`, `assigned_mechanic_id`
    - `pickup_latitude`, `pickup_longitude`, `pickup_address`
    - `estimated_price`, `final_price`
    - `created_at`, `updated_at`, `completed_at`
    - `shop_id`, `category_id`

    ---

    ### 3️⃣ **payments** ⭐⭐⭐⭐⭐
    **Usage:** CRITICAL - Used in 20+ queries
    - Admin payments page
    - Admin dashboard
    - Analytics/reports
    - Payment tracking
    - Financial reports

    **Key Columns Used:**
    - `id`, `request_id`, `customer_id`, `provider_id`
    - `amount`, `platform_fee`, `provider_amount`
    - `payment_method`, `payment_gateway`, `transaction_id`
    - `status`, `processed_at`, `created_at`
    - `payment_verification_required`, `verification_status`

    ---

    ### 4️⃣ **service_providers** ⭐⭐⭐⭐
    **Usage:** HIGH - Used in 15+ queries
    - Admin mechanics section
    - Admin analytics
    - Payment processing
    - Service requests (provider info)

    **Key Columns Used:**
    - `id`, `user_id`, `company_name`
    - `rating`, `total_reviews`
    - `is_verified`, `is_available`, `status`
    - `shop_id`, `talyer_owner_id`

    ---

    ### 5️⃣ **talyer_owner_verifications** ⭐⭐⭐⭐
    **Usage:** HIGH - Used in admin verifications
    - Admin verifications page (main feature)
    - Verification management
    - Document review
    - Business permit validation

    **Key Columns Used:**
    - `id`, `user_id`, `business_name`
    - `business_permit_url`, `valid_id_url`, `profile_image_url`
    - `id_type`, `permit_expiry_date`, `id_expiry_date`
    - `status`, `admin_notes`, `reviewed_by`, `reviewed_at`
    - `verification_score`, `tamper_flags`
    - `is_permit_expired`, `is_id_expired`

    ---

    ### 6️⃣ **shops** ⭐⭐⭐
    **Usage:** MEDIUM - Used in service requests
    - Service request routing
    - Shop information display
    - Mechanic assignment

    **Key Columns Used:**
    - `id`, `shop_name`, `shop_address`
    - `owner_id`, `latitude`, `longitude`
    - `is_active`, `current_status`

    ---

    ### 7️⃣ **service_categories** ⭐⭐⭐
    **Usage:** MEDIUM - Used in service requests
    - Service classification
    - Request categorization
    - Service type display

    **Key Columns Used:**
    - `id`, `name`, `description`
    - `base_price`, `is_active`

    ---

    ## 📋 **AUDIT & LOGGING TABLES (Admin Features)**

    ### 8️⃣ **audit_logs** ⭐⭐⭐
    **Usage:** Admin verifications - Audit trail tab
    - System-wide audit logging
    - Action tracking across all tables

    **Key Columns Used:**
    - `id`, `user_id`, `role`, `action`
    - `table_name`, `record_id`
    - `old_values`, `new_values`, `additional_data`
    - `success`, `error_message`, `created_at`

    ---

    ### 9️⃣ **admin_activity_logs** ⭐⭐⭐
    **Usage:** Admin verifications & dashboard
    - Admin action tracking
    - Verification approval logs
    - Payment release logs

    **Key Columns Used:**
    - `id`, `admin_id`, `action_type`
    - `target_type`, `target_id`, `action_details`
    - `ip_address`, `created_at`

    ---

    ### 🔟 **account_security_logs** ⭐⭐
    **Usage:** Security reports & admin verifications
    - Login/logout tracking
    - Failed login attempts
    - Document uploads
    - Profile changes

    **Key Columns Used:**
    - `id`, `user_id`, `action_type`
    - `ip_address`, `user_agent`, `location_info`
    - `success`, `failure_reason`, `details`
    - `created_at`

    ---

    ## 💰 **PAYMENT-RELATED TABLES**

    ### 1️⃣1️⃣ **payment_releases** ⭐⭐
    **Usage:** Admin dashboard & financial reports
    - Payment release management
    - Provider payouts
    - Admin approval workflow

    **Key Columns Used:**
    - `id`, `payment_id`, `request_id`, `provider_id`
    - `total_amount`, `platform_fee`, `provider_amount`
    - `release_status`, `release_method`
    - `admin_id`, `approved_at`, `released_at`

    ---

    ### 1️⃣2️⃣ **invoices** ⭐⭐
    **Usage:** Disputes section (admin dashboard)
    - Invoice tracking
    - Disputed transactions
    - Payment processing

    **Key Columns Used:**
    - `id`, `request_id`, `customer_id`
    - `invoice_number`, `total_amount`
    - `status` (including 'disputed')
    - `created_at`

    ---

    ### 1️⃣3️⃣ **cash_payment_verifications** ⭐
    **Usage:** Admin dashboard statistics
    - Cash payment verification
    - QR code validation
    - Receipt verification

    **Key Columns Used:**
    - `id`, `payment_id`, `request_id`
    - `verification_status`
    - Count of pending verifications

    ---

    ## 🔧 **SUPPORT TABLES**

    ### 1️⃣4️⃣ **reviews** ⭐⭐
    **Usage:** Analytics page
    - Rating calculations
    - Customer feedback
    - Provider performance

    **Key Columns Used:**
    - `id`, `rating`, `customer_id`, `provider_id`

    ---

    ### 1️⃣5️⃣ **app_settings** ⭐
    **Usage:** Settings page
    - System configuration
    - Feature toggles
    - Admin settings

    **Key Columns Used:**
    - `id`, `key`, `value`, `is_public`

    ---

    ## ❌ **TABLES NOT USED in Current System**

    These tables exist in your schema but are **NOT queried** in the current codebase:

    1. ❌ `business_permits` - Not used
    2. ❌ `customer_job_history` - Not used
    3. ❌ `distance_pricing_config` - Not used
    4. ❌ `do_not_disturb_settings` - Not used
    5. ❌ `document_verifications` - Not used
    6. ❌ `email_notifications` - Not used
    7. ❌ `email_verification_tokens` - Not used
    8. ❌ `inspection_reports` - Not used
    9. ❌ `job_completion_codes` - Not used
    10. ❌ `mechanic_availability_status` - Not used
    11. ❌ `mechanic_invitations` - Not used
    12. ❌ `mechanic_job_history` - Not used
    13. ❌ `mechanics` - Not used
    14. ❌ `messages` - Not used
    15. ❌ `notification_delivery_log` - Not used
    16. ❌ `notification_templates` - Not used
    17. ❌ `notifications` - Not used
    18. ❌ `password_reset_tokens` - Not used
    19. ❌ `payment_methods` - Not used
    20. ❌ `paymongo_webhook_events` - Not used
    21. ❌ `profile_image_logs` - Not used
    22. ❌ `profile_updates` - Not used
    23. ❌ `progress_photos` - Not used
    24. ❌ `provider_availability_cache` - Not used
    25. ❌ `provider_services` - Not used
    26. ❌ `request_broadcasts` - Not used
    27. ❌ `request_routing` - Not used
    28. ❌ `request_status_history` - Not used
    29. ❌ `service_availability_matrix` - Not used
    30. ❌ `service_completions` - Not used
    31. ❌ `service_history` - Not used
    32. ❌ `service_phase_tracking` - Not used
    33. ❌ `shop_mechanics` - Not used
    34. ❌ `shop_notifications` - Not used
    35. ❌ `shop_services` - Not used
    36. ❌ `shop_settings` - Not used
    37. ❌ `shop_stats_cache` - Not used
    38. ❌ `system_statistics` - Not used
    39. ❌ `talyer_customer_connections` - Not used
    40. ❌ `temporary_passwords` - Not used
    41. ❌ `user_locations` - Not used
    42. ❌ `user_notification_preferences` - Not used
    43. ❌ `vehicles` - Not used

    ---

    ## 📊 **Summary Statistics**

    ### ✅ **Tables Currently Used: 15 tables**
    - Core operational tables: 7
    - Audit/logging tables: 3
    - Payment-related tables: 3
    - Support tables: 2

    ### ❌ **Tables Not Used: 43 tables**
    These are defined in schema but never queried

    ### 📈 **Usage Breakdown:**
    - **Critical (5-star):** 5 tables (user_profiles, service_requests, payments, service_providers, talyer_owner_verifications)
    - **High (4-star):** 2 tables (shops, service_categories)
    - **Medium (3-star):** 3 tables (audit_logs, admin_activity_logs, invoices)
    - **Low (2-star):** 3 tables (account_security_logs, payment_releases, reviews)
    - **Minimal (1-star):** 2 tables (cash_payment_verifications, app_settings)

    ---

    ## 🎯 **Recommendations**

    ### For Your Current System:
    ✅ **Focus on these 15 active tables** for:
    - Data integrity
    - RLS policies
    - Indexes
    - Backups
    - Performance optimization

    ### Unused Tables:
    ⚠️ **Consider:**
    1. Removing unused tables to simplify schema
    2. Documenting why they're unused (future features?)
    3. Archiving schema for future reference
    4. Keeping only if planning to implement those features

    ### Data Creation Priority:
    Based on usage frequency, create sample data for:
    1. ✅ `payments` (already has insert script)
    2. ✅ `service_requests` (already populated)
    3. ✅ `user_profiles` (already populated)
    4. ⚠️ `payment_releases` (create sample data)
    5. ⚠️ `reviews` (create sample data)

    ---

    ## 📝 **Notes**

    **This analysis is based on:**
    - Grep search of all `.from()` queries in TypeScript/JavaScript files
    - Actual code usage in admin pages, dashboard, and reports
    - Does not include tables that might be used by:
    - Database triggers
    - External services
    - Future planned features
    - Flutter mobile app (if separate)

    **Last Updated:** October 3, 2025  
    **Files Analyzed:** All `.tsx`, `.ts`, `.js` files in workspace
