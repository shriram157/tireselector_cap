context tireSelector {
  
  
      entity dealerMarkUp {
            @title : 'Dealer Code'
        key Dealer_code          : String(20);

            @title : 'This is the Brand (Toyota or Lexus) - SAP name = Division'
        key Dealer_Brand         : String(2);

            @title : 'This is the Brand ID'
        key Manufacturer_code    : String(30);

            @title : 'The UI should enforce a range of 0-100  with 2 decimal place.'
            Preview_Markup_Percentage     : Decimal(4, 2);

            @title : 'The UI should enforce a range of 0-100  with 2 decimal place.'
            Live_Markup_Percentage        : Decimal(4, 2);

            @title : 'This is the date the product markup was set to ![Live]'
            Live_Last_Updated    : Timestamp;

            @title : 'This is the LDAP User ID of the person that set the product markup was set to ![Live] (not displayed on the UI)'
            Live_Last_Updated_By : String(100);

            @title : 'This is the First Name of the person that set the product markup was set to ![Live]'
            User_First_Name      : String(100);

            @title : 'This is the Last Name of the person that set the product markup was set to ![Live]'
            User_Last_Name       : String(100);

            @title : 'IS Live'
            IsLive               : String(1);            
    }
   
};