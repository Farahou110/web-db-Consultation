
document.addEventListener( `DOMContentLoaded`,()=>{
    const ExpenseForm = document.getElementById("transactionForm")
    
    
    ExpenseForm.addEventListener( "submit",async(e)=>{
        e.preventDefault();
    
        const formData = new FormData(ExpenseForm)
        const Name = formData.get("Name");
        const Amount = formData.get("Amount");
        const Date = formData.get("Date");
        try {
            const response = await fetch("/index",{ 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                     },
                body:JSON.stringify({UserName,Password})
    
            });
        if(response.ok){
            alert(`Added successful`)
             }
               {alert(` Failed`) }       
                } 
            catch (error) {
                console.error({err:err});
                   alert(`error occured durin Adding New Expense`)
                }
            });
        });