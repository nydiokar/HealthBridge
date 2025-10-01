TLR 4 spec 

Boundaries for  AI GP Support System

What   means (software context):

Prototype components exist.

They can run in a lab/test environment.

They show the principle works, even if ugly or incomplete.

Not needed: scalability, resilience, full UX, full security stack, multi-language, DevOps, production hosting.

Prototype Plan 

A. Citizen Interface (Frontend Mock)

Simple web form with 3–5 input fields (symptom description, duration, optional fever, allergies).

Submit button.

Store locally or in SQLite.

Goal: Show structured input is possible.
Skip: Styling, multilingual support, offline sync.

B. Triage Engine (Mock Logic)

Simple rule-based classifier:

“Fever > 38 → Red”

“Cough + fever → Yellow”

Else → Green.

Return color-coded label.

Goal: Show classification exists.
Skip: Full AI/ML model.

C. GP Dashboard (Basic View)

Simple page that lists submitted cases.

Columns: Patient ID (fake), symptom summary, triage color.

Click = expand details.

Goal: Show GPs can see structured summaries.
Skip: User roles, advanced filtering, record history.

D. Authentication (Reuse existing module)

Add your prebuilt login/auth system.

One GP login, one citizen login.

Goal: Show role-based access exists.
Skip: Password reset, OAuth, GDPR-level details.

Strict “Do Not Build” List (Keep You Focused)

Do not optimize code for production.

Do not build full medical taxonomy or symptom tree.

Do not implement offline sync, caching, or translations.

Do not integrate with real patient data or EHR systems.

Do not add DevOps pipelines, containerization, CI/CD.

Do not polish UI beyond bare minimum.
