# Fastor Nodejs Assignment

# Fastor Final Round - NodeJs Developer

**Time allotted:** 2 hrs

## Assignment Goal

Designing a backend for a customer relationship management (CRM) system. You only need to code the REST API.

## Business Logic / Core Functionality

1. The CRM account is associated with each **employee/counselor** of the company with their email ID.
2. There is an **enquiry form** which is provided to every prospective client to fill their basic details (i.e., Name, Email, Course interest, etc.). This form can be circulated online to capture leads or can be shared by the counselor itself after connecting with the student via call.
3. Inside the CRM, each employee/counselor can see all the enquiries that prospective clients have filled. These are **Public Enquiries** that are visible to all the employees/counselors.
4. Against each public enquiry, the employee/counselor has a choice to **"Claim"** it. Claiming it will assign the enquiry to only this counselor inside the CRM & this enquiry will no longer be publically visible to any other employee. This is now a **private enquiry**.

## Requirements

- Database must be **SQLite**/**PostgreSQL/MySQL/MongoDB**.
- You are only required to design the **REST API** for the above-mentioned tasks.
- You need to use the **Express Framework**.
- You need to use **JWT token** for authentication.

## Acceptance Criteria (APIs to Implement)

- API for **Employee login/register**.
- **Public form API** must be accessible **without any authentication** (for clients to submit enquiries).
- API to **claim leads**.
- API to **fetch unclaimed leads** (Public Enquiries).
- API to **fetch leads claimed by logged in users** (Private Enquiries).

## Conclusion

The backend must be coded in NodeJs. You are free to use any library to design the above system. Ready. Set. Code.