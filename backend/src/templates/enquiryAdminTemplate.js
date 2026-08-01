const enquiryAdminTemplate = ({ enquiry, productSnapshot }) => {
  return `
<!DOCTYPE html>

<html>

<body style="font-family:Arial;background:#f5f5f5;padding:40px;">

<div style="max-width:800px;background:#fff;padding:30px;margin:auto;">

<h2 style="color:#7B7F5C;">
New ${enquiry.type.toUpperCase()} Enquiry
</h2>

<table
width="100%"
border="1"
cellpadding="10"
cellspacing="0"
style="border-collapse:collapse;">

<tr>

<td width="220"><b>Name</b></td>

<td>${enquiry.fullName}</td>

</tr>

<tr>

<td><b>Email</b></td>

<td>${enquiry.email}</td>

</tr>

<tr>

<td><b>Mobile</b></td>

<td>${enquiry.mobile}</td>

</tr>

<tr>

<td><b>Company</b></td>

<td>${enquiry.companyName}</td>

</tr>

<tr>

<td><b>Country</b></td>

<td>${enquiry.country}</td>

</tr>

<tr>

<td><b>Business Type</b></td>

<td>${enquiry.businessTypes.join(", ")}</td>

</tr>

<tr>

<td><b>Category</b></td>

<td>${enquiry.productCategory}</td>

</tr>

<tr>

<td><b>Sub Category</b></td>

<td>${enquiry.productSubCategory}</td>

</tr>

${
  enquiry.type === "product"
    ? `
<tr>

<td><b>Product</b></td>

<td>${productSnapshot.name}</td>

</tr>

<tr>

<td><b>SKU</b></td>

<td>${productSnapshot.sku}</td>

</tr>

<tr>

<td><b>Slug</b></td>

<td>${productSnapshot.slug}</td>

</tr>

<tr>

<td><b>Image</b></td>

<td>

<img
src="${productSnapshot.image}"
width="120"
/>

</td>

</tr>
`
    : ""
}

<tr>

<td><b>Message</b></td>

<td>${enquiry.message}</td>

</tr>

<tr>

<td><b>Status</b></td>

<td>${enquiry.status}</td>

</tr>

<tr>

<td><b>Created</b></td>

<td>${new Date(enquiry.createdAt).toLocaleString()}</td>

</tr>

</table>

</div>

</body>

</html>
`;
};

export default enquiryAdminTemplate;