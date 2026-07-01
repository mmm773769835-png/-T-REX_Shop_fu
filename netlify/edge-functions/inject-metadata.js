export default async (request, context) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";
  
  // Check if request is for a product
  const productId = url.searchParams.get("product");
  
  // Crawler detection
  const isCrawler = /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex|chrome-lighthouse|lighthouse|whatsapp|facebook|twitter|telegram/i.test(userAgent);
  
  if (productId && isCrawler) {
    try {
      // Fetch product details from Supabase
      const supabaseUrl = "https://udqnrsrwzifrzseixrcj.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcW5yc3J3emlmcnpzZWl4cmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTk5MzQsImV4cCI6MjA5MzMzNTkzNH0.dh2SotKNPpIjttwERWph243yfeV_6rlnkKVfcoEbcGM";
      
      const apiResponse = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${productId}&select=*`, {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        }
      });
      
      if (apiResponse.ok) {
        const products = await apiResponse.json();
        if (products && products.length > 0) {
          const product = products[0];
          
          // Get the original index.html response
          const response = await context.next();
          let html = await response.text();
          
          const productName = product.name || "منتج مميز";
          const productDesc = product.description || "تسوّق الآن من متجر T-REX SHOP. منتجات أصلية، أسعار تنافسية، وتوصيل سريع.";
          const productImage = product.image_url || product.imageUrl || "https://trexshopmax.com/logo.png";
          
          // Replace meta tags
          html = html.replace(
            /<meta property="og:title" content="[^"]*">/i,
            `<meta property="og:title" content="${productName}">`
          );
          html = html.replace(
            /<meta property="og:description" content="[^"]*">/i,
            `<meta property="og:description" content="${productDesc}">`
          );
          html = html.replace(
            /<meta property="og:image" content="[^"]*">/i,
            `<meta property="og:image" content="${productImage}">`
          );
          html = html.replace(
            /<meta name="twitter:title" content="[^"]*">/i,
            `<meta name="twitter:title" content="${productName}">`
          );
          html = html.replace(
            /<meta name="twitter:description" content="[^"]*">/i,
            `<meta name="twitter:description" content="${productDesc}">`
          );
          html = html.replace(
            /<meta name="twitter:image" content="[^"]*">/i,
            `<meta name="twitter:image" content="${productImage}">`
          );
          
          // Add dynamic title tag
          html = html.replace(
            /<title>[^<]*<\/title>/i,
            `<title>${productName} | T-REX SHOP</title>`
          );
          
          return new Response(html, {
            headers: { "content-type": "text/html; charset=UTF-8" },
          });
        }
      }
    } catch (err) {
      console.error("Error in inject-metadata edge function:", err);
    }
  }
  
  return context.next();
};
