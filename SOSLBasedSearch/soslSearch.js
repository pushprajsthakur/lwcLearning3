
import { api, LightningElement, track } from 'lwc';
import search from '@salesforce/apex/SearchController.search';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';

const COLS =[
    
    {label:'Name', fieldName:'Name'},
    {label:'Service Type', fieldName:'ServiceType'},
    {label:'Record Type', fieldName:'RecordType'},
    {label: 'Street', fieldName: 'BillingStreet' , type: 'text'},
    {label: 'City', fieldName: 'BillingCity' , type: 'text'}, 
    {label: 'State', fieldName: 'BillingState' , type: 'text'},
     {label: 'Country', fieldName: 'BillingCountry' , type: 'text'}, 
     {label: 'Zipcode', fieldName: 'BillingPostalCode' , type: 'text'}
]
export default class SoslSearch extends NavigationMixin(LightningElement) {

   
    @track searchQuery = null;
    @track searchResults = null;
    @track showResults = false;
    columns = COLS
    @track parentData =[];
    @track serviceDatafilter=[];
    @track BillingDatafilter=[];
    @api valueChosen;
    

    inputChange(event){
        this.searchQuery = event.detail.value;
    }

    getResults(query){
        search({text:query}).then(data =>{
         //BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry
            this.searchResults = JSON.parse(JSON.stringify(data));
            console.log(' this.searchResults  :'+ JSON.stringify(this.searchResults));

            this.BillingDatafilter =this.searchResults.filter(function (item)
            {
              return item.Service_Type__c =='Billing' 
                    
            }
            );
            this.serviceDatafilter =this.searchResults.filter(function (item)
            {
              return item.Service_Type__c =='Service' 
                    
            }
            );

            this.parentData = this.BillingDatafilter.map(item=>{
               
                
                return {
                    "Id": item.Id,
                    "Name": item.Name,
                    "ServiceType":item.Service_Type__c,
                    "RecordType":'RecordType' in item ?item.RecordType.Name :"",
                    "BillingStreet":'BillingStreet' in item ?item.BillingStreet :"",
                    "BillingCity":'BillingCity' in item ?item.BillingCity :"",
                    "BillingState":'BillingState' in item ?item.BillingState :"",
                    "BillingCountry":'BillingCountry' in item ?item.BillingCountry :"",
                    "BillingPostalCode":'BillingPostalCode' in item ?item.BillingPostalCode :"",
                    
                   
                }
            })
            this.serviceData= this.serviceDatafilter.map(item=>{
                return {
                    "Id": item.Id,
                    "Name": item.Name,
                    "ServiceType":item.Service_Type__c,
                    "RecordType":'RecordType' in item ?item.RecordType.Name :"",
                    "BillingStreet":'BillingStreet' in item ?item.BillingStreet :"",
                    "BillingCity":'BillingCity' in item ?item.BillingCity :"",
                    "BillingState":'BillingState' in item ?item.BillingState :"",
                    "BillingCountry":'BillingCountry' in item ?item.BillingCountry :"",
                    "BillingPostalCode":'BillingPostalCode' in item ?item.BillingPostalCode :"",
                    
                   
                }
            })


            console.log('this.parentData): '+JSON.stringify(this.parentData));
            
            console.log('this.serviceData): '+JSON.stringify(this.serviceData));
            this.showResults = true;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Search Completed.',
                variant: 'Success'
            }));
        }).catch(errors =>{
            this.searchQuery = null;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: errors,
                variant: 'error'
            }));
            this.showResults = false;
        });
    }

    handleClick(event){
        if(this.searchQuery == null || this.searchQuery == undefined || this.searchQuery.trim() == ""){
            this.dispatchEvent(new ShowToastEvent({
                title:'Error',
                message: 'Search text needed',
                variant: 'error'
            }));
            this.showResults = false;
            return;
        }
        console.log('Searching Query '+this.searchQuery);
        this.getResults(this.searchQuery);
    }
    getSelectedRec() {
        var selectedRecords =  this.template.querySelector("lightning-datatable").getSelectedRows();
        if(selectedRecords.length ==1 ){
            //console.log('selectedRecords are ', JSON.stringify(selectedRecords));
   console.log(selectedRecords[0].Id);
           // let ids = ids + ',' + selectedRecords.Id;
           
            //this.selectedIds = ids.replace(/^,/, '');
            //this.valueChosen = ids.replace(/^,/, '');
           //console.log('this.valueChosen'+JSON.stringify(this.valueChosen));
           const defaultValues = encodeDefaultFieldValues({
            ParentId: selectedRecords[0].Id
           
        });

        /* Navigate to Create Account with Parent Id selected*/
        //    this[NavigationMixin.Navigate]({
        //     type: 'standard__objectPage',
        //     attributes: {
        //         objectApiName: 'Account',
        //         actionName: 'new'
        //     },
        //     state: {
        //         defaultFieldValues: defaultValues
        //     }
        // });
        }  
        if(selectedRecords.length > 1  ){
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Please Select One Account Only',
                variant: 'error'
            }));
        }
      }


}
