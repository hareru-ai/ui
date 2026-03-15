import styles from './logo.module.css';

export function Logo() {
  return (
    <>
      <img src="/logo_symbol--light.svg" alt="Hareru UI" className={styles.light} />
      <img src="/logo_symbol--dark.svg" alt="Hareru UI" className={styles.dark} />
    </>
  );
}
