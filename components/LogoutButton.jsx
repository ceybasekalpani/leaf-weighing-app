import { useState } from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useAuth } from '../src/context/AuthContext';
import { useLeafData } from '../src/context/LeafDataContext';

export default function LogoutButton() {
  const { logout } = useAuth();
  const { setLeafCollections, setLeafDeductions } = useLeafData();
  const [visible, setVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setError('');
    const result = await logout();
    if (result.success) {
      setLeafCollections([]);
      setLeafDeductions([]);
      // AuthContext switches the navigator to Login and removes the tabs.
    } else {
      setError(result.error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <Button
        icon="logout"
        textColor="#FFFFFF"
        compact
        accessibilityLabel="Log out"
        onPress={() => { setError(''); setVisible(true); }}
      >
        Logout
      </Button>
      <Portal>
        <Dialog visible={visible} dismissable={!isLoggingOut} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Log out?</Dialog.Title>
          <Dialog.Content>
            <Text>You will return to the login screen. Unsaved changes will be lost.</Text>
            {error ? <Text accessibilityRole="alert">{error}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button disabled={isLoggingOut} onPress={() => setVisible(false)}>Cancel</Button>
            <Button loading={isLoggingOut} disabled={isLoggingOut} onPress={handleLogout}>Log out</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
