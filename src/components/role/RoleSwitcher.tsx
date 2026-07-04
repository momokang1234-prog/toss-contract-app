/**
 * Role Switcher (Dev Only)
 *
 * Development tool for quickly switching roles
 * Only visible in development mode
 *
 * @module components/role/RoleSwitcher
 */

import { useState, useEffect } from 'react';
import { Overlay, BottomSheet, Button, Flex, Text, Spacing } from '@toss/tds-mobile';
import type { UserRole } from '@/lib/role-detection';
import { useCurrentUserRole } from '@/hooks/useUserId';

/**
 * Check if in development mode
 */
const IS_DEV = import.meta.env.DEV;

interface RoleSwitcherProps {
  /** Position variant */
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
  /** Show on mount */
  showOnMount?: boolean;
}

/**
 * Dev-only role switcher
 */
export function RoleSwitcher({
  position = 'bottom-right',
  showOnMount = false,
}: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(showOnMount);
  const currentRole = useCurrentUserRole();

  // Don't render in production
  if (!IS_DEV) {
    return null;
  }

  /**
   * Handle role switch
   */
  const handleSwitchRole = async (newRole: UserRole) => {
    try {
      // Mock role update (in real app, call API)
      console.log('[RoleSwitcher] Switching to:', newRole);

      // Update session storage for mock mode
      if (sessionStorage.getItem('mock_role')) {
        sessionStorage.setItem('mock_role', newRole);
      }

      // Reload page to apply new role
      window.location.reload();
    } catch (error) {
      console.error('[RoleSwitcher] Failed to switch role:', error);
    }
  };

  /**
   * Handle reset preferences
   */
  const handleResetPreferences = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const positionStyles = {
    'bottom-right': {
      position: 'fixed' as const,
      bottom: 20,
      right: 20,
      zIndex: 9999,
    },
    'bottom-left': {
      position: 'fixed' as const,
      bottom: 20,
      left: 20,
      zIndex: 9999,
    },
    'top-right': {
      position: 'fixed' as const,
      top: 20,
      right: 20,
      zIndex: 9999,
    },
  };

  return (
    <>
      {/* Trigger Button */}
      <div style={positionStyles[position]}>
        <Button
          size="small"
          variant="secondary"
          onClick={() => setIsOpen(true)}
          style={{
            fontSize: '12px',
            padding: '8px 12px',
            opacity: 0.8,
          }}
        >
          🔄 {currentRole || '미선택'}
        </Button>
      </div>

      {/* Role Switcher Modal */}
      {isOpen && (
        <Overlay open>
          <BottomSheet
            open
            height="auto"
            onClose={() => setIsOpen(false)}
            renderTitle={() => (
              <Text typo="t5" bold>
                🔧 Dev Tools: Role Switcher
              </Text>
            )}
            content={
              <Flex direction="column" gap={16} padding={20}>
                <Flex direction="column" gap={8}>
                  <Text typo="body2" color="grey-600">
                    Current Role: <Text bold>{currentRole || 'None'}</Text>
                  </Text>
                  <Text typo="caption1" color="grey-500">
                    Development mode only. This will not appear in production.
                  </Text>
                </Flex>

                <Button
                  size="large"
                  variant={currentRole === 'employer' ? 'primary' : 'secondary'}
                  onClick={() => handleSwitchRole('employer')}
                >
                  👔 Switch to Employer
                </Button>

                <Button
                  size="large"
                  variant={currentRole === 'worker' ? 'primary' : 'secondary'}
                  onClick={() => handleSwitchRole('worker')}
                >
                  👷 Switch to Worker
                </Button>

                <Button
                  size="large"
                  variant="ghost"
                  onClick={handleResetPreferences}
                >
                  🔄 Reset All Preferences
                </Button>
              </Flex>
            }
            renderFooter={() => (
              <Flex padding={20}>
                <Button
                  size="large"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
              </Flex>
            )}
          />
        </Overlay>
      )}
    </>
  );
}

/**
 * Compact role badge (for dev toolbar)
 */
export function RoleBadge() {
  const currentRole = useCurrentUserRole();

  if (!IS_DEV) {
    return null;
  }

  const roleColors = {
    employer: 'blue',
    worker: 'green',
    null: 'grey',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        padding: '8px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        zIndex: 9999,
        cursor: 'pointer',
      }}
      onClick={() => {
        // Trigger role switcher
        document.dispatchEvent(new CustomEvent('open-role-switcher'));
      }}
    >
      {currentRole === 'employer' && '👔 Employer'}
      {currentRole === 'worker' && '👷 Worker'}
      {!currentRole && '❓ No Role'}
    </div>
  );
}

/**
 * Dev toolbar with multiple tools
 */
export function DevToolbar() {
  const [isOpen, setIsOpen] = useState(false);

  if (!IS_DEV) {
    return null;
  }

  return (
    <>
      {/* Toolbar Trigger */}
      <div
        style={{
          position: 'fixed',
          bottom: 70,
          right: 20,
          zIndex: 9999,
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          🔧
        </button>
      </div>

      {/* Dev Tools Modal */}
      {isOpen && (
        <Overlay open>
          <BottomSheet
            open
            height="80%"
            onClose={() => setIsOpen(false)}
            renderTitle={() => (
              <Text typo="t5" bold>
                🔧 Development Tools
              </Text>
            )}
            content={
              <Flex direction="column" gap={16} padding={20}>
                <Text typo="body2" bold>
                  Quick Actions
                </Text>

                <Flex direction="column" gap={8}>
                  <Text typo="caption1" color="grey-600">
                    • Role: Switch between employer/worker
                  </Text>
                  <Text typo="caption1" color="grey-600">
                    • Consent: Toggle consent states
                  </Text>
                  <Text typo="caption1" color="grey-600">
                    • Reset: Clear all local data
                  </Text>
                  <Text typo="caption1" color="grey-600">
                    • Debug: Toggle debug mode
                  </Text>
                </Flex>
              </Flex>
            }
            renderFooter={() => (
              <Flex padding={20}>
                <Button
                  size="large"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
              </Flex>
            )}
          />
        </Overlay>
      )}
    </>
  );
}

/**
 * Hook to listen for role switcher events
 */
export function useRoleSwitcherListener() {
  useEffect(() => {
    const handleOpen = () => {
      // Dispatch custom event to open role switcher
      window.dispatchEvent(new CustomEvent('open-role-switcher'));
    };

    // Listen for custom events
    window.addEventListener('open-role-switcher', handleOpen);

    return () => {
      window.removeEventListener('open-role-switcher', handleOpen);
    };
  }, []);
}
