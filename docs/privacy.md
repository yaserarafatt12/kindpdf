# Privacy Policy & Zero-Server Security Guarantee — LocalPDF

**Project Name:** LocalPDF  
**Tagline:** Your documents never leave your device.  
**Brand Credit:** LocalPDF by edsheero  
**Effective Date:** 2026-08-01  

---

## 1. Zero-Server Processing Principle

LocalPDF is engineered from the ground up on a **100% In-Browser Execution** model. When you use any tool on LocalPDF (Merge, Split, Organize, Extract, Images to PDF), your documents are loaded into your device's RAM and processed locally using JavaScript Web Workers.

- **Zero Cloud Uploads:** Your files are never sent over the internet to any server, database, or third-party cloud service.
- **Zero Document Retention:** Once you close or refresh the page, all loaded file buffers are immediately cleared from your browser's RAM.
- **Zero Ad Trackers or Telemetry:** No third-party tracking scripts, analytics cookies, or behavioral profiling tools are installed.

---

## 2. Technical Data Handling

| Data Type | Storage Location | Server Transfer? | Retained After Refresh? |
| :--- | :--- | :--- | :--- |
| **PDF Files & Images** | Device RAM (`ArrayBuffer`) | ❌ NO | ❌ NO (Cleared on close) |
| **Rendered Page Previews** | Browser Canvas (`Blob URL`) | ❌ NO | ❌ NO (Revoked on close) |
| **Theme / Language Preference** | Browser `LocalStorage` | ❌ NO | ✅ YES (UI preferences only) |

---

## 3. Transparency & Open Source

The entire source code of LocalPDF is open-source and publicly inspectable on GitHub at:  
[https://github.com/yaserarafatt12/localpdf](https://github.com/yaserarafatt12/localpdf)

You can verify in the browser Network Inspector tab (F12) that zero HTTP POST / PUT requests containing file payloads are ever transmitted during file processing.
