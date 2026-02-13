import { createContext, useContext, useState } from 'react';

const LeafDataContext = createContext();

export const LeafDataProvider = ({ children }) => {
  const [leafCollections, setLeafCollections] = useState([]);
  const [leafDeductions, setLeafDeductions] = useState([]);

  const addLeafCollection = (collection) => {
    setLeafCollections(prev => [...prev, { ...collection, id: Date.now().toString() }]);
  };

  const addLeafDeduction = (deduction) => {
    setLeafDeductions(prev => [...prev, { ...deduction, id: Date.now().toString() }]);
  };

  return (
    <LeafDataContext.Provider value={{
      leafCollections,
      leafDeductions,
      addLeafCollection,
      addLeafDeduction,
      setLeafCollections,
      setLeafDeductions,
    }}>
      {children}
    </LeafDataContext.Provider>
  );
};

export const useLeafData = () => useContext(LeafDataContext);