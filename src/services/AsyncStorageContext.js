import React, { createContext, useContext, useEffect, useState } from 'react';


export const AsyncStorageContext = createContext();

export const AsyncStorageProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(false);


  return (
    <AsyncStorageContext.Provider value={{ userLocation,setUserLocation }}>
      {children}
    </AsyncStorageContext.Provider>
  );
};
export const useUserLocation = () => {
    const { userLocation,setUserLocation } = useContext(AsyncStorageContext);
    return {userLocation,setUserLocation};
};



