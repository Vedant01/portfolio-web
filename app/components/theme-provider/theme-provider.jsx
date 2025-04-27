// Update font imports to use public paths
const fonts = {
  GothamMedium: '/assets/fonts/Gotham-Medium.otf',
  GothamMediumItalic: '/assets/fonts/Gotham-MediumItalic.otf',
  GothamBook: '/assets/fonts/Gotham-Book.otf',
  GothamBookItalic: '/assets/fonts/Gotham Book Italic.otf',
  GothamBold: '/assets/fonts/GOTHAM-BOLD.TTF',
  GothamBlackItalic: '/assets/fonts/GOTHAM-BLACKITALIC.TTF'
};

// Reminder: Always use root-relative paths (e.g. /assets/...) for static assets in code and CSS.
// Reminder: Move all runtime assets (fonts, .glb, images) to public/assets/ and update code references accordingly.
// Reminder: Check file/folder case sensitivity and ensure all assets are committed and pushed to git before deploying to Vercel.

import { createContext, useContext } from 'react';
import { classes, media } from '~/utils/style';
import { themes, tokens } from './theme';

export const ThemeContext = createContext({});

export const ThemeProvider = ({
  theme = 'dark',
  children,
  className,
  as: Component = 'div',
  toggleTheme,
  ...rest
}) => {
  const parentTheme = useTheme();
  const isRootProvider = !parentTheme.theme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme: toggleTheme || parentTheme.toggleTheme,
      }}
    >
      {isRootProvider && children}
      {/* Nested providers need a div to override theme tokens */}
      {!isRootProvider && (
        <Component className={classes(className)} data-theme={theme} {...rest}>
          {children}
        </Component>
      )}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const currentTheme = useContext(ThemeContext);
  return currentTheme;
}

/**
 * Squeeze out spaces and newlines
 */
export function squish(styles) {
  return styles.replace(/\s\s+/g, ' ');
}

/**
 * Transform theme token objects into CSS custom property strings
 */
export function createThemeProperties(theme) {
  return squish(
    Object.keys(theme)
      .map(key => `--${key}: ${theme[key]};`)
      .join('\n\n')
  );
}

/**
 * Transform theme tokens into a React CSSProperties object
 */
export function createThemeStyleObject(theme) {
  let style = {};

  for (const key of Object.keys(theme)) {
    style[`--${key}`] = theme[key];
  }

  return style;
}

/**
 * Generate media queries for tokens
 */
export function createMediaTokenProperties() {
  return squish(
    Object.keys(media)
      .map(key => {
        return `
        @media (max-width: ${media[key]}px) {
          :root {
            ${createThemeProperties(tokens[key])}
          }
        }
      `;
      })
      .join('\n')
  );
}

const layerStyles = squish(`
  @layer theme, base, components, layout;
`);

const tokenStyles = squish(`
  :root {
    ${createThemeProperties(tokens.base)}
  }

  ${createMediaTokenProperties()}

  [data-theme='dark'] {
    ${createThemeProperties(themes.dark)}
  }

  [data-theme='light'] {
    ${createThemeProperties(themes.light)}
  }
`);

const createFontStyles = fonts => `
  @font-face {
    font-family: 'Gotham';
    src: local('Arial'), local('Helvetica'),
         url('${fonts.GothamBook}') format('opentype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Gotham';
    src: local('Arial Italic'), local('Helvetica Oblique'),
         url('${fonts.GothamBookItalic}') format('opentype');
    font-weight: normal;
    font-style: italic;
    font-display: swap;
  }
  @font-face {
    font-family: 'Gotham';
    src: local('Arial Bold'), local('Helvetica Bold'),
         url('${fonts.GothamMedium}') format('opentype');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Gotham';
    src: local('Arial Bold Italic'), local('Helvetica Bold Oblique'),
         url('${fonts.GothamMediumItalic}') format('opentype');
    font-weight: 500;
    font-style: italic;
    font-display: swap;
  }
  @font-face {
    font-family: 'Gotham';
    src: local('Arial Black'), local('Helvetica Black'),
         url('${fonts.GothamBold}') format('truetype');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Gotham';
    src: local('Arial Black Italic'), local('Helvetica Black Oblique'),
         url('${fonts.GothamBlackItalic}') format('truetype');
    font-weight: 900;
    font-style: italic;
    font-display: swap;
  }`;

export const fontStyles = createFontStyles(fonts);

export const themeStyles = squish(`
  ${layerStyles}

  @layer theme {
    ${tokenStyles}
    ${fontStyles}
  }
`);
