import { useCallback, useEffect, useRef } from 'react';
import { Keyboard, Platform, TextInput } from 'react-native';

export default function useKeyboardAutoScroll() {
  const scrollRef = useRef(null);
  const focusedInputRef = useRef(null);
  const scrollOffsetRef = useRef(0);
  const timerRef = useRef(null);

  const scrollToFocusedInput = useCallback(() => {
    const input = focusedInputRef.current;
    const scrollView = scrollRef.current;

    if (!input || !scrollView || TextInput.State.currentlyFocusedInput() !== input) {
      return;
    }

    if (Platform.OS === 'web') {
      input.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
      return;
    }

    scrollView.measureInWindow((scrollX, scrollY, scrollWidth, scrollHeight) => {
      input.measureInWindow((inputX, inputY, inputWidth, inputHeight) => {
        if (focusedInputRef.current !== input || TextInput.State.currentlyFocusedInput() !== input) {
          return;
        }

        const keyboardTop = Keyboard.metrics()?.screenY ?? Infinity;
        const visibleBottom = Math.min(scrollY + scrollHeight, keyboardTop) - 24;
        const visibleTop = scrollY + 12;
        let adjustment = 0;

        if (inputY + inputHeight > visibleBottom) {
          adjustment = inputY + inputHeight - visibleBottom;
        } else if (inputY < visibleTop) {
          adjustment = inputY - visibleTop;
        }

        if (adjustment !== 0) {
          scrollView.scrollTo({
            y: Math.max(0, scrollOffsetRef.current + adjustment),
            animated: true,
          });
        }
      });
    });
  }, []);

  const scheduleScroll = useCallback(() => {
    clearTimeout(timerRef.current);
    // Wait for focus and keyboard-driven layout changes to finish.
    timerRef.current = setTimeout(scrollToFocusedInput, 100);
  }, [scrollToFocusedInput]);

  const onInputFocus = useCallback(() => {
    focusedInputRef.current = TextInput.State.currentlyFocusedInput();
    scheduleScroll();
  }, [scheduleScroll]);

  const onInputBlur = useCallback(() => {
    focusedInputRef.current = null;
    clearTimeout(timerRef.current);
  }, []);

  const onScroll = useCallback((event) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', scheduleScroll);
    const frameSubscription = Keyboard.addListener('keyboardDidChangeFrame', scheduleScroll);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      clearTimeout(timerRef.current);
    });

    return () => {
      clearTimeout(timerRef.current);
      showSubscription.remove();
      frameSubscription.remove();
      hideSubscription.remove();
    };
  }, [scheduleScroll]);

  return {
    inputFocusProps: { onFocus: onInputFocus, onBlur: onInputBlur },
    scrollViewProps: {
      ref: scrollRef,
      onScroll,
      scrollEventThrottle: 16,
      onLayout: scheduleScroll,
      onContentSizeChange: scheduleScroll,
      keyboardShouldPersistTaps: 'handled',
    },
  };
}
