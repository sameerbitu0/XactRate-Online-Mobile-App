const STRING_CONSTANTS = {

  /**
   * project alert Messages Strings 
   * @AlertBox {*} Alert Box Message 
   */

  default_alert_box_tittle:'Xact Rate',
  select_client_alert_box:'Please select a client.',
  add_product_alert_box:'Please add a product to this ticket',
  auto_start_timer_alert_box:'Do you want to start T&D Time?',
  stop_timer_alert_box:'Please Stop Timer.',
  close_ticket_alert_box:'This ticket has been closed.',
  suspend_ticket_alert_box:'This ticket has been suspend.',
  decline_ticket_alert_box:'This ticket has been decline.',
  locked_ticket_alert_box:'This ticket has been locked.',
  download_invoice_alert_box:'Do you want to download PDF ?',
  pay_amount_without_signature_alert_box:'Do you want to continue payment without signing ticket?',
  select_employee_alert_box:'Employee already exists.',
  delete_ticket_alert_box:'Do you want to delete ticket ?',
  captured_signature_alert_box:'Signature Captured Successfully',
  edit_service_agreement_alert_box:'User can not edit Service Agreement.',
  edit_timer_alert_box:'User can not edit Timer.',
  delete_timer_alert_box:'User can not delete Timer.',



  //----------------------------------------New Screen String----------------------------------------------//


  /**
   * Splash Screen String 
   * @Strings 
   */

  splash_screen_text: 'XactRate',

  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Login Screen Screen String 
   * @Strings 
   */

  login_screen_welcome_text: 'Welcome to XactRate',
  login_screen_sub_heading_text: 'Login',
  email_required: 'Enter a valid email address',
  password_required: 'Password is required',
  forgot_password_login: 'Forgot Password ?',

  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Forgot Password Screen Screen String 
   * @Strings 
   */

  forgot_password: 'RESET PASSWORD',
  sign_in: 'Sign In ?',
  reset_password_button_text: 'Send Reset Password Link',

  //----------------------------------------New Screen String----------------------------------------------//


  /**
   * Dashborad Screen Screen String 
   * @Strings 
   */

  user_name_tittle: 'Welcome,',
  open_ticket: 'Open',
  close_ticket: 'Close',
  up_coming_ticket: 'Upcoming',
  tickets: 'Tickets',
  recent_tickets: 'Recent Tickets',
  recent_clients: 'Recent Clients',

  //----------------------------------------New Screen String----------------------------------------------//


  /**
   * Schedule Screen Screen String 
   * @Strings 
   */

  null_screen_data_string:'No Schedule Clients.',


  //----------------------------------------New Screen String----------------------------------------------//


  /**
   * Project Placeholder String 
   * @Strings 
   */

  search_client_name: 'Search...',
  total_pay: 'Total Pay',
  check_number: 'Cheque No',
  note: 'Note',

  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Switch Selector Filter Button & status String 
   * @Strings 
   */

  all: 'All',
  schedule: 'Schedule',
  close: 'Closed ',
  decline: 'Decline',
  suspend: 'Suspend',

  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Details Screen Screen String 
   * @Strings 
   */

  convert_to_invoice: 'Convert To Invoice',
  edit_ticket: 'Edit Ticket',
  ticket_details: 'Ticket Details',

  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Ticket Screen Screen String 
   * @Strings 
   */

  client_required: 'Client is required',
  ticket_type_required: 'Ticket type is required',
  total_pay_required: 'Balance paid is required',
  payment_type_required: 'Payment Type is required',
  add_client: 'Add Client',
  create_invoice_title: 'Create Invoice',
  ticket_type_text: 'Ticket Type',
  select_client_bottom_sheet_title: 'Select Client',
  select_ticket_button_title: 'Select Ticket',
  invoice_date_label: 'Date',
  td_time_title: 'T&D Time',
  job_time_title: 'Job Time',
  pause_time_title: 'Pause Time',
  start_time: 'Start',
  pause_time: 'Pause',
  products_title: 'Products',
  add_product_button: 'Add Product',
  add_service_agreement_button: 'Service Agreement',
  create_product_button: 'Create Product',
  product_quantity: 'Quantity',
  product_labor_time: 'Labor Time:',
  product_amount_sign: '$',
  balance_due: 'Balance Due',
  payment_type_button_title: 'Payment Type',
  payment_type_cash: 'Cash',
  payment_type_cheque: 'Cheque',
  payment_type_credit_card: 'Credit Card',
  delete_product_button_title: 'Delete',
  edit_product_button_title: 'Start',
  invoice_save: 'Convert To Invoice',

  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Select Catalog String 
   * @Strings 
   */

  select_catalog_screen_title: 'Select Catalog',

  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Select Category String 
   * @Strings 
   */ 
  
  select_category_screen_title: 'Select Category',

   //----------------------------------------New Screen String----------------------------------------------//


  /**
   * Select Product String 
   * @Strings 
   */

  select_product_screen_title: 'Select Product',

  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Product Details String 
   * @Strings 
   */ 

  product_Detail_screen_title: 'Product Details',
  catalog_code_label: 'Catalog Code',
  product_code_label: 'Product Code',
  description_label: 'Description',
  labor_label: 'Labor Time',
  price_label: 'Price',
  product_plus_labor_button_text: 'Product + Labour',
  edit_product_button_text: 'Edit Product',
  no_charge_button_text: 'No Charge',

  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Select Employee String 
   * @Strings 
   */

  select_employee_screen_title: 'Select Employee',

  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Service Agreement String 
   * @Strings 
   */

  service_agreement_screen_title: 'Service Agreement',

  //----------------------------------------New Screen String----------------------------------------------//

   /**
   * General String 
   * @Strings 
   */

  product_plus_labor_text: 'Product + Labour',
  state_label_text: 'State',
  city_label_text: 'City',
  zip_label_text: 'Zip',
  address_line_1_label_text: 'Address Line 1',
  address_line_2_label_text: 'Address Line 2',
  phone_no_1_label_text: 'Phone No.1',
  phone_no_2_label_text: 'Phone No.2',
  phone_label_text: 'Phone',
  email_label_text: 'Email',
  password_label_text: 'Password',
  confirm_password_label_text: 'Confirm Password',
  first_name_label_text: 'First Name',
  last_name_label_text: 'Last Name',
  company_name_label_text: 'Company Name',
  individual_label_text: 'Individual',
  organization_label_text: 'Organization',
  amount_label: 'Amount',
  create_custom_product_label: 'Create Custom Product',
  add_employee: 'Add Employee',
  total_ticket_details: 'Total',
  download_pdf_text: 'Download',

  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Error messages String 
   * @Strings 
   */

  enter_valid_email_text: 'Enter a valid email address',


  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Create Client Screen String 
   * @Strings 
   */

  client_fname_required: 'First name is required',
  client_lname_required: 'Last name is required',
  client_phone_no_required: 'Phone number is required',

  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Create Ticket Screen String 
   * @Strings 
   */
  
  create_ticket_title: 'Create Ticket',
  client_name_label: 'Client Name',
  ticket_type_label: 'Ticket Type',
  create_ticket_button_label: 'Create Ticket',
  cancel_button_label: 'Cancel',


  //----------------------------------------New Screen String----------------------------------------------//


  /**
   * Edit Ticket Screen String 
   * @Strings 
   */

  edit_ticket_title: 'Edit Ticket',
  delete_ticket: 'Delete Ticket',
  save_ticket: 'Save Ticket',
  no_ticket: 'No Tickets available',


  //----------------------------------------New Screen String----------------------------------------------//

  /**
   * Custom Product String 
   * @Strings 
   */

  product_code_required: 'Product code is required',
  description_required: 'Description is required',
  product_qty_required: 'Quantity is required',
  total_hour_required: 'Please Enter Labour Time',
  amount_required: 'Amount is required',

};

export default STRING_CONSTANTS;
