const browser = globalThis.browser || chrome;

document.addEventListener('DOMContentLoaded', function() {
  const textInput = document.getElementById('textInput');
  const saveButton = document.getElementById('saveButton');
  const status = document.getElementById('status');
  const error = document.getElementById('error');
  const rDefaultId = document.getElementById('rdefault');
  const rJiraId = document.getElementById('rjira');
  const rMdId = document.getElementById('rmd');
  const rPumlId = document.getElementById('rpuml');

  browser.storage.local.get('savedText').then(function(result) {
    if (result.savedText) 
    {
      textInput.value = result.savedText;
      status.textContent = 'Loaded.';
      setTimeout(() => status.textContent = '', 2000);
    }
    else
    {
	    setDefault();
	    document.getElementById('rdefault').checked = true;
    }
  });

  browser.storage.local.get('option').then(function(result) {
    if (result.option) {
      document.getElementById( result.option ).checked = true;
    }
  });

  function setDefault()
  {
     browser.storage.local.set({ option: "rdefault" });

     textInput.value = "${url} - ${desc} - [${id}]";
     const simChangeEvent = new Event('input', { 'bubbles': true });
     
     textInput.dispatchEvent(simChangeEvent);
  }
  
  rPumlId.addEventListener('click', function() 
  {
     browser.storage.local.set({ option: "rpuml" });

     textInput.value = "[[${url} - ${desc} - [${id}]]]";
     const simChangeEvent = new Event('input', { 'bubbles': true });
     
     textInput.dispatchEvent(simChangeEvent);
  });

  rDefaultId.addEventListener('click', function() 
  {
     setDefault();
  });

  rJiraId.addEventListener('click', function() 
  {
     browser.storage.local.set({ option: "rjira" });

     textInput.value = "[${desc} - [${id}]|${url}]";
     const simChangeEvent = new Event('input', { 'bubbles': true });

     textInput.dispatchEvent(simChangeEvent);
  });

  rMdId.addEventListener('click', function() 
  {
     browser.storage.local.set({ option: "rmd" });

     textInput.value = "[${url}](${desc} - [${id}])";
     const simChangeEvent = new Event('input', { 'bubbles': true });

     textInput.dispatchEvent(simChangeEvent);
  });

  saveButton.addEventListener('click', function() {
    window.close();
  });

  // Autosave on input change (debounced)
  let saveTimeout;
  textInput.addEventListener('input', function() 
  {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(function() 
    {
      const text = textInput.value;
      if ( checkInput( text ) )
      {
			browser.storage.local.set({ savedText: text });
			status.textContent = 'Autosave...';
      }
      else
      {
	      error.textContent = 'Error! Template invalid.';
      }
      
      setTimeout(() => status.textContent = '', 1000);
      setTimeout(() => error.textContent = '', 1000);
    }, 500);
  });
});

function checkInput( text )
{
	return text.includes( "${id}" ) || text.includes( "${url}" ) || text.includes( "${desc}" )
}