const fs = require('fs');
const components = ['Button', 'PrimaryButton', 'SecondaryButton', 'DangerButton', 'IconButton', 'Card', 'Badge', 'StatusBadge', 'Alert', 'InfoPanel', 'Input', 'Select', 'Modal', 'ProgressBar', 'LoadingState', 'ErrorState', 'EmptyState', 'SectionHeader'];
components.forEach(c => {
  const content = `export function ${c}({ children, className = '', ...props }: any) { return <div className={\`component-${c} \${className}\`} {...props}>{children || '${c}'}</div> }`;
  fs.writeFileSync('src/components/ui/' + c + '.tsx', content);
});
