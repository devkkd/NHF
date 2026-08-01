const enquiryCustomerTemplate = ({ enquiry, productSnapshot }) => {
  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8" />
</head>

<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f4">

<tr>

<td align="center">

<table width="650" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="margin:40px auto;border-radius:8px;overflow:hidden;">

<tr>
<td bgcolor="#7B7F5C" align="center" style="padding:30px;">

<h1 style="margin:0;color:#ffffff;">
NIKITA HOME FURNISHINGS
</h1>

</td>
</tr>

<tr>

<td style="padding:40px;">

<h2>Hello ${enquiry.fullName},</h2>

<p>
Thank you for contacting
<strong>Nikita Home Furnishings.</strong>
</p>

<p>
We have successfully received your enquiry.
Our export team will contact you within
<strong>24 Hours.</strong>
</p>

${
  enquiry.type === "product"
    ? `
<h3>Product Details</h3>

<table width="100%" cellpadding="8" cellspacing="0" border="1">

<tr>
<td width="180"><strong>Product</strong></td>
<td>${productSnapshot.name}</td>
</tr>

<tr>
<td><strong>SKU</strong></td>
<td>${productSnapshot.sku}</td>
</tr>

</table>

<br>
`
    : ""
}

<h3>Your Details</h3>

<table width="100%" cellpadding="8" cellspacing="0" border="1">

<tr>

<td width="180"><strong>Name</strong></td>

<td>${enquiry.fullName}</td>

</tr>

<tr>

<td><strong>Email</strong></td>

<td>${enquiry.email}</td>

</tr>

<tr>

<td><strong>Company</strong></td>

<td>${enquiry.companyName}</td>

</tr>

<tr>

<td><strong>Country</strong></td>

<td>${enquiry.country}</td>

</tr>

</table>

<br>

<p>
We'll get back to you shortly.
</p>

<p>

Regards,

<br><br>

<b>Nikita Home Furnishings</b>

</p>

</td>

</tr>

<tr>

<td bgcolor="#eeeeee" align="center" style="padding:20px;font-size:13px;">

38, Gupta Garden, Govind Nagar West, Amer Road, Jaipur – 302002, Rajasthan

<br>

nikitahomefurnishings@yahoo.com

<br>

+91 9460387858

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;
};

export default enquiryCustomerTemplate;