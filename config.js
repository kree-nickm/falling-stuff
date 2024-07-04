document.forms.params.elements.create.addEventListener("click", event => {
  event.preventDefault();
  
  window.params = {};
  let paramProps = ["icon","font","color","speed","yOffset","width","size","delay","delayVary","rotate"];
  let paramList = [];
  for(let param of paramProps)
  {
    if(document.forms.params.elements[param].value)
    {
      paramList.push(`${param}=`+encodeURIComponent(document.forms.params.elements[param].value));
      window.params[param] = document.forms.params.elements[param].value;
    }
  }
  if(document.forms.params.elements.names.value)
  {
    let names = document.forms.params.elements.names.value.split(/[,;\n]/g).map(name=>name.trim()).filter(name=>name);
    paramList.push(`names=`+names.map(name=>encodeURIComponent(name)).join(","));
    window.params.names = names.join(",");
  }
  setParams();
  
  document.forms.params.elements.url.value = "https://kree-nickm.github.io/falling-stuff/source.html?" + paramList.join("&");
  createItems();
  document.forms.params.elements.preview.disabled = false;
});

document.forms.params.elements.preview.addEventListener("click", event => {
  event.preventDefault();
  //document.forms.params.elements.create.dispatchEvent(new Event("click"));
  //window.open(document.forms.params.elements.url.value, '_blank');
  document.forms.params.elements.preview.disabled = true;
  startFalling();
});