import { LightningElement, wire, api } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi'
import { createRecord } from 'lightning/uiRecordApi'
import { NavigationMixin } from 'lightning/navigation';
import NAME_FIELD from '@salesforce/schema/Opportunity.Name'
import PRICEBOOK_REC from '@salesforce/schema/Opportunity.Pricebook2.Id'
import OPP_LINE_ITEM from '@salesforce/schema/OpportunityLineItem'
import GetPricebookEntries from '@salesforce/apex/GetPricebookEntry.GetPricebookEntries';

const COLS =[
    {label:'Pricebookentryid', fieldName:'Id'},
    {label:'Product Name', fieldName:'Name'},
    {label:'List Price', fieldName:'UnitPrice', type:'currency'},
    {label:'Quantity', fieldName:'Quantity', editable:true},
    { label: 'Discount', fieldName: 'Discount',editable: true, type:'percent' },
    { label: 'Total Amount', fieldName: 'TotalAmount',type:'currency'}
]
export default class Oppdatatable extends NavigationMixin(LightningElement) {
    formFields={}
    PriceTool = []
    columns = COLS
    draftValues = []
    oplineitem = OPP_LINE_ITEM
    nopricebook
    @api recordId
    
    p2Id
    // @wire(getRecord, {recordId:'$recordId',
    //  fields:[NAME_FIELD, OWNER_NAME_FIELD, ANNUAL_REVENUE_FIELD]})
    @wire(getRecord, {recordId:'$recordId',fields:[NAME_FIELD,PRICEBOOK_REC]})
     oppHandler({data}){
        if (data) {
            this.p2Id = data.fields.Pricebook2.value.fields.Id.value;
            this.nopricebook = this.p2Id ?this.p2Id:''
            console.log(this.p2Id)
            this.getP2Id()
             

         }
     }
    getP2Id() {
        GetPricebookEntries({ P2Id: this.p2Id })
        .then((result) => {
           console.log(result);
           this.PriceTool = result.map(item=>{
            return {
                "Id": item.Id,
                "Name": item.Name,
                "UnitPrice": item.UnitPrice,
                "Quantity": 0,
                "Discount": 0,
                "TotalAmount":0
            }
        })
        })
        .catch((error) => {
          console.error(error);
        });
    }
    handleSave(event) {
        console.log(JSON.stringify(event.detail.draftValues));
        const recordInputs = event.detail.draftValues.map(draft => {
            for (let i = 0; i < this.PriceTool.length; i++) {
                //console.log(this.PriceTool[i].Id)
                //UnitPrice: this.PriceTool[i].UnitPrice,
                // 
                if (draft.Id == this.PriceTool[i].Id) {
                    const newfields = {
                        apiName: this.oplineitem.objectApiName,
                        fields: {
                            PricebookEntryId: this.PriceTool[i].Id,
                            OpportunityId: this.recordId,
                            Quantity: draft.Quantity,
                            Discount: draft.Discount ? draft.Discount : 0,
                            TotalPrice:(((draft.Quantity)*(this.PriceTool[i].UnitPrice))-(((draft.Discount ? draft.Discount : 0)/100)*(draft.Quantity)*(this.PriceTool[i].UnitPrice)))
                        }
                    }
                    const fields = { ...newfields }
                    console.log('fields'+JSON.stringify(newfields))

                    return fields ;
                   
                  
                 
           
                    // console.log(recordInputs);
                    //return { apiName: this.oplineitem.objectApiName, fields:fields };
                    // })
                    //console.log(recordInputs);
                    //  this.handleOppLineItem(recordInputs)
                }
            }
        })
        //console.log("record" + JSON.stringify(recordInputs));
        this.PriceTool = []
        
        const promises = recordInputs.map(recordInput =>createRecord(recordInput))
        Promise.all(promises).then(()=>{
            console.log('OppLineItem updated Successfully')
            this[NavigationMixin.Navigate]({
                type:'standard__recordPage',
                attributes:{
                    recordId:this.recordId,
                    objectApiName:'Opportunity',
                    actionName:'view'
                }
            })
           // this.draftValues=[]
        }).catch(error=>{
            console.error("Error updating the record", error)
        })

        
    }
    handlechange(event){
        console.log(JSON.stringify(event.detail));
    }
    handlerowchange(event) {
        console.log(JSON.stringify(event.detail));
        //
        if(event.detail.draftValues[0].Quantity){
        for (let i = 0; i < this.PriceTool.length; i++) {
            if (event.detail.draftValues[0].Id == this.PriceTool[i].Id) {
                this.PriceTool[i].Quantity = event.detail.draftValues[0].Quantity
                this.PriceTool[i].TotalAmount = event.detail.draftValues[0].Quantity ? event.detail.draftValues[0].Quantity * this.PriceTool[i].UnitPrice : 0
            }
        }
        }
        if(event.detail.draftValues[0].Discount){
            for (let i = 0; i < this.PriceTool.length; i++) {
                if (event.detail.draftValues[0].Id == this.PriceTool[i].Id) {
                    this.PriceTool[i].Discount = event.detail.draftValues[0].Discount
                    this.PriceTool[i].TotalAmount = this.PriceTool[i].Quantity ? (this.PriceTool[i].Quantity * this.PriceTool[i].UnitPrice)-((this.PriceTool[i].Quantity * this.PriceTool[i].UnitPrice)*(event.detail.draftValues[0].Discount/100)) : 0
                }
            }
        }
        console.log(this.PriceTool);
    }
  
    handleCancel() {
        console.log("cancel")
        this[NavigationMixin.Navigate]({
            type:'standard__recordPage',
            attributes:{
                recordId:this.recordId,
                actionName:'view'
            }
        })
    }  
}
