# TODO: Integrate Map for Real-Time Rider Tracking

## Approved Plan Steps
- [x] Add Socket.IO dependencies to package.json
- [x] Integrate Socket.IO in src/server.ts
- [x] Add updateLocation function to src/controller/ridersContoller.ts
- [x] Add route for updating location in src/router/riderRouter.ts
- [x] Add getAvailableRiders function to src/controller/userController.ts
- [x] Add route for fetching available riders in src/router/userRouter.ts
- [ ] Optionally add location field to src/models/userModel.ts (if needed for proximity)
- [x] Install new dependencies
- [ ] Test location update and fetch endpoints
- [ ] Implement real-time updates via Socket.IO
- [ ] Prepare for frontend Google Maps integration
