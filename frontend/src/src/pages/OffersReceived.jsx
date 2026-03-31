import React, { useState, useEffect } from "react";
import "./OffersReceived.css";

function OffersReceived() {

const [offers,setOffers] = useState([]);
const [selectedTrader,setSelectedTrader] = useState(null);

useEffect(()=>{

const storedOffers = JSON.parse(localStorage.getItem("offers"));

if(storedOffers){
setOffers(storedOffers);
}else{

const demoOffers = [
{
id:1,
crop:"Fresh Tomatoes",
trader:"Trader DX-9307",
price:22,
quantity:200,
phone:"9876543210",
location:"Pune Market",
status:"Pending"
},
{
id:2,
crop:"New Potatoes",
trader:"Trader DX-98521",
price:17,
quantity:300,
phone:"9123456780",
location:"Mumbai APMC",
status:"Pending"
}
];

setOffers(demoOffers);
localStorage.setItem("offers",JSON.stringify(demoOffers));
}

},[]);


const acceptOffer = (offer)=>{

const updatedOffers = offers.map((o)=>{
if(o.id === offer.id){
return {...o,status:"Accepted"};
}
return o;
});

setOffers(updatedOffers);

localStorage.setItem("offers",JSON.stringify(updatedOffers));

setSelectedTrader(offer);

};


const rejectOffer = (id)=>{

const updatedOffers = offers.map((o)=>{
if(o.id === id){
return {...o,status:"Rejected"};
}
return o;
});

setOffers(updatedOffers);

localStorage.setItem("offers",JSON.stringify(updatedOffers));

};


return (

<div className="offers-page">

<h2>Offers Received</h2>

{offers.map((offer)=>(
<div className="offer-card" key={offer.id}>

<h3>{offer.crop}</h3>

<p>Trader: {offer.trader}</p>

<p>Offer Price: ₹{offer.price}/kg</p>

<p>{offer.quantity} KG</p>

<p className={`status ${offer.status}`}>
Status: {offer.status}
</p>

<div className="offer-buttons">

<button
className="accept-btn"
onClick={()=>acceptOffer(offer)}
>
Accept
</button>

<button
className="reject-btn"
onClick={()=>rejectOffer(offer.id)}
>
Reject
</button>

</div>

</div>
))}

{/* POPUP */}

{selectedTrader && (

<div className="popup-overlay">

<div className="popup-card">

<h3>Trader Details</h3>

<p><strong>ID:</strong> {selectedTrader.trader}</p>

<p><strong>Phone:</strong> {selectedTrader.phone}</p>

<p><strong>Location:</strong> {selectedTrader.location}</p>

<p><strong>Offer Price:</strong> ₹{selectedTrader.price}/kg</p>

<button
className="close-btn"
onClick={()=>setSelectedTrader(null)}
>
Close
</button>

</div>

</div>

)}

</div>

);

}

export default OffersReceived;