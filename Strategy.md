## 🏗 **Revised Phase-by-Phase Implementation**

### **Phase 1: Core Data Collection (Step 1 UI)**

🎯 **Goal:** Simple, engaging first step to get user started.

👥 **User Scenario:**

- User chooses loan type
- Enters net monthly income
- Adjusts loan amount & term sliders
- (No calculation yet)
- Presses **“Продължи”** → goes to Step 2

**Deliverables:**

- **Step 1 Screen:**
    - Loan type selector (Mortgage / Consumer)
    - Net monthly income input
    - Loan amount & term sliders
    - CTA button

✅ **Test:** Validate UX is minimal, quick, mobile-friendly.

---

### **Phase 2: Detailed Inputs (Step 2 UI)**

🎯 **Goal:** Collect all additional info before calculation.

👥 **User Scenario:**

- User fills:
    - Existing monthly debt
    - Interest rate (pre-filled)
    - Down payment (only for mortgage)
- Presses **“Виж резултатите”**

**Deliverables:**

- **Step 2 Screen:**
    - Existing debt input
    - Interest rate input
    - Down payment input (conditional)
    - CTA button triggers API call

✅ **Test:** Verify correct payload is sent to API (loanType, income, debts, loanAmount, term, interest, downPayment).

---

### **Phase 3: API Calculation & Results (Step 3 UI)**

🎯 **Goal:** Show clear, trustworthy results.

👥 **User Scenario:**

- After clicking “Виж резултатите” → loader shows briefly
- User sees:
    - ✅ Verdict: Affordable / ❌ Not affordable
    - Monthly payment
    - % of income used
    - Total repayment

**Deliverables:**

- **Results Screen:**
    - Big headline verdict
    - Summary of results from API
    - (Optional) Expandable sections:
        - Property tax & insurance estimate (if mortgage)
        - Late payment consequences panel
        - ГПР vs. interest explanation

✅ **Test:** Ensure results are correct & match API calculation exactly.

---

### **Phase 4: Lead Capture / Contact**

🎯 **Goal:** Convert engaged users after showing value.

👥 **User Scenario:**

- User chooses to:
    - Save result via email
    - Contact advisor
- Enters email, name, region (optional)
- Confirms consent

**Deliverables:**

- Simple contact form
- Backend integration for saving lead / sending confirmation

✅ **Test:** Validate GDPR checkbox is required, data is stored securely.

---

### **Phase 5: UX Polish & Enhancements**

🎯 **Goal:** Improve trust and usability after launch.

👥 **User Scenario:**

- User sees better defaults and clearer explanations.

**Deliverables:**

- Improved copy & microcopy
- Add tooltips (“Why we ask this”)
- Add progress indicator (Step 1 → Step 2 → Results)
- Smooth transitions between steps

✅ **Test:** Track drop-offs between steps, iterate to reduce friction.

---

### **Phase 6: Analytics & Optimization**

🎯 **Goal:** Measure and optimize.

- Capture analytics: Step 1 completion, Step 2 completion, result screen views, lead form submissions
- A/B test different button texts (“Виж резултатите” vs. “Провери достъпност”)
- Adjust UX based on data (e.g., shorten Step 2 if too many drop off)

---

### 🧭 **User Journey Summary (Updated)**

1. **Step 1:** Pick loan type + enter income + choose amount/term → Continue
2. **Step 2:** Enter existing debt + interest rate + down payment → Get Results
3. **Step 3:** See results (calculated via API) → Verdict + repayment summary
4. **Step 4:** Optional lead capture / advisor contact
