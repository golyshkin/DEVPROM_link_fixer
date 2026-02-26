const browser = globalThis.browser || chrome;

document.addEventListener(
  'click',
  async function (e) {
    // get nearest button
    const button = e.target.closest('button.clipboard, a.clipboard');

    if (!button) return;

    // check clipboard
    if (!button.classList.contains('clipboard')) return;

    // get data from clipboard
    let reqCaption = null;
    let captionId = null;
    let reqId = 0;

    const originalText = button.getAttribute('data-clipboard-text');
    if (!originalText) return;
    
    const urlParts = originalText.split('/');
	 const lastUrlPart = urlParts[urlParts.length - 1];
    const projectId = lastUrlPart.split('.')[0];

    const parts = originalText.split(' - ');

    if (parts.length === 2) 
    {
      reqId = parts[1].split( "?" )[0].trim();

      if (/^\d+$/.test(reqId)) 
      {
        captionId = 'WikiPageCaption' + reqId
        console.log('The DEVPROM requirement id: ', captionId);
        captionElement = document.getElementById(captionId)

        if ( captionElement ) 
        {
          reqCaption = captionElement.innerText;
          console.log('The DEVPROM requirement caption: ', reqCaption);
        } 
        else 
        {
          reqCaption = getTitle( reqId );

          if ( reqCaption.length == 0 )
          {
             // One more chance to find a fucking DEVPROM requirement title
             const elements = document.querySelectorAll(`[objectid="${reqId}"]`);
             const firstWithTitle = Array.from(elements).find(el => el.hasAttribute('title'));
    
             if (firstWithTitle) 
             {
               reqCaption = firstWithTitle.innerText;
             } 
             else 
             {
               console.log('The DEVPROM requirement is not found: ', reqId);
             }
          }
        }
      }
    }
    else
    {
       const parts = originalText.split( "/")
       const title = parts[ parts.length - 1].split("?")[0]

	    reqCaption = getTitle( title );
    }

    // Template is used by default if there is no saved yet
    pattern = "${url} - ${desc} - [${id}]";

    await browser.storage.local.get('savedText').then(function(result) 
    {
      if (result.savedText) 
      {
        pattern = result.savedText;
      }
    });

	 console.log( pattern );
    
    // Final transform
    modifiedText = pattern.replace( "${url}", encodeURI(originalText) );
    modifiedText = modifiedText.replace( "${id}", reqId );
    modifiedText = modifiedText.replace( "${desc}", reqCaption );

    // Consume event
    e.preventDefault();
    e.stopImmediatePropagation();

    // copy to clipboard
    try {
      // The HTML format is hardcoded
      const htmlLink = "<a class=\"uid with-tooltip\" info=\"/pm/" + projectId + "/tooltip/Requirement/" + reqId + "\" data-placement=\"right\" href=\"" + encodeURI( originalText ) + "\" target=\"_blank\" title=\"\">" + reqCaption + " - [" + reqId +"]</a>";
      const htmlContent = new Blob([htmlLink], { type: 'text/html; charset=utf-8' });
      const textContent = new Blob([modifiedText], { type: 'text/plain' });
		const clipboardItem = new ClipboardItem({
				'text/html': htmlContent,
				'text/plain': textContent
				});
      
      await navigator.clipboard.write([clipboardItem]);      
      
      console.log('The DEVPROM requirement copied to clipboard:', modifiedText);
    } catch (err) {
      console.error('The DEVPROM requirement copy to clipboard ERROR:', err);
    }
    // Close dropdown menu if the clicked element is <a>
    if (button.tagName.toLowerCase() === 'a') {
        const menu = button.closest('div.dropdown-fixed');
        if (menu && menu.classList.contains('open')) {
          console.log('The DEVPROM drop-down menu is removed');
          menu.remove();
        }
    }
  },
  true // register event
);

function getTitle( findStr )
{
   const elements = document.getElementsByClassName("fancytree-title");
   let reqCaption = "";

   if ( elements.length > 0 )
   {
      for ( let i = 0; i < elements.length; i++ ) 
      {
         if ( elements[i].innerText.includes( findStr ) ) 
         {
             const splitCaption = elements[i].innerText.split(findStr).map(splitCaption => splitCaption.trim());
             let reqCaption = splitCaption[splitCaption.length - 1];

             console.log('The DEVPROM requirement caption: ', reqCaption);
             return reqCaption;
         }
      }
   }

   // Lets search in Requirements Registry
   if ( reqCaption == "" )
   {
   	const targetRow = document.querySelector( `tr[object-id="${findStr}"]` );

		if ( targetRow ) 
		{
			reqCaption = targetRow.querySelector('.fancytree-title');
    
			if ( reqCaption ) 
			{
				reqCaption = reqCaption.textContent.trim();
			} 
		} 
   }
    
   return reqCaption;
}