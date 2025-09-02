# UberEats-Style Driver App Clone (with Pause & Reroute Feature)

A React Native (Expo) demo driver app that replicates real-world delivery scenarios inspired by UberEats and Deliveroo — but with a twist: a fully working “Pause Order” and auto-reroute feature for multi-pickup workflows.

This project demonstrates thoughtful product design, clean architecture, and real-time features using Firebase, Firestore, and Google Maps Directions API.

## Why This Exists

I built this as a hands-on demo to explore real-world delivery edge cases like order delays, rerouting, and dynamic pickups. Even though it’s a clone, building the **pause logic** made me appreciate how much product thinking goes into apps like UberEats and Deliveroo.

##  Features

- Accept and manage multiple orders (`in_progress`, `paused`, `picked_up`)
- Live driver location tracking with **Google Maps Directions API**
- Pause an order and auto-route to the next one
- Seamless order state updates using **Firebase Firestore**
- One-tap calling to store phone numbers
- Secure API key handling via `.env`

---

## Tech Stack

- **React Native (with Expo SDK)**
- **Firebase Firestore** – real-time backend for orders
- **Expo Location API** – for live GPS tracking
- **Google Maps Directions API** – for routing between pickups
- **.env + app.config.js** – secure secret injection

---

## Demo Flow

1. New orders are stored in Firestore
2. Driver accepts → status becomes `in_progress`
3. Live map renders pickup route
4. If delayed, driver taps **Pause** → order is set to `paused`
5. App auto-routes to the next available order
6. When all pickups are done → message shows: **All pickups completed**

---

## Pros & Benefits

### For Drivers:
- Skip delayed pickups
- Save time with dynamic rerouting
- Easy access to store info

### For Delivery Platforms:
- More efficient routing
- Better customer experience
- Boosts driver satisfaction & app usability

---

## Setup & Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/viks11021/driver-demo-app.git
cd driver-demo-app
```

2. Add a .env file

```
GOOGLE_MAPS_API_KEY=your_real_maps_api_key_here
```
