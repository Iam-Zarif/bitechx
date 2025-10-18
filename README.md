# BiTechX — Notes for Reviewers

* **Apis Checked Through Postman**
* **Frontend-only** assignment using BiTechX mock APIs.
* **Auth:** simple email login → `POST /auth`, token stored (Redux + localStorage).
* **Protected routes:** current client guard; when **profile API** is available I’ll add stronger protection (middleware/server checks).
* **Images:** for now I use **URL input**. I’m experienced with **direct file uploads to Cloudinary**; can switch to file upload (no URL needed) quickly.
* **Edit flow:** product details route is by **slug**. After edit, slug may change → to avoid broken navigation I **redirect to `/products`** on successful update.
