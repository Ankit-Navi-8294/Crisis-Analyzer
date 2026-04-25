import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  return (
    <DataContext.Provider value={{ data, setData, lastUpdated, setLastUpdated }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
