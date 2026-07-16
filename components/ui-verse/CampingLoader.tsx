// From Uiverse.io by Admin12121 – converted to CSS Modules + JSX
import styles from "./CampingLoader.module.css";

export default function CampingLoader() {
  return (
    <div className={styles.scene}>
      {/* Forest */}
      <div className={styles.forest}>
        <div className={`${styles.tree} ${styles.tree1}`}>
          <div className={`${styles.branch} ${styles.branchTop}`}></div>
          <div className={`${styles.branch} ${styles.branchMiddle}`}></div>
        </div>

        <div className={`${styles.tree} ${styles.tree2}`}>
          <div className={`${styles.branch} ${styles.branchTop}`}></div>
          <div className={`${styles.branch} ${styles.branchMiddle}`}></div>
          <div className={`${styles.branch} ${styles.branchBottom}`}></div>
        </div>

        <div className={`${styles.tree} ${styles.tree3}`}>
          <div className={`${styles.branch} ${styles.branchTop}`}></div>
          <div className={`${styles.branch} ${styles.branchMiddle}`}></div>
          <div className={`${styles.branch} ${styles.branchBottom}`}></div>
        </div>

        <div className={`${styles.tree} ${styles.tree4}`}>
          <div className={`${styles.branch} ${styles.branchTop}`}></div>
          <div className={`${styles.branch} ${styles.branchMiddle}`}></div>
          <div className={`${styles.branch} ${styles.branchBottom}`}></div>
        </div>

        <div className={`${styles.tree} ${styles.tree5}`}>
          <div className={`${styles.branch} ${styles.branchTop}`}></div>
          <div className={`${styles.branch} ${styles.branchMiddle}`}></div>
          <div className={`${styles.branch} ${styles.branchBottom}`}></div>
        </div>

        <div className={`${styles.tree} ${styles.tree6}`}>
          <div className={`${styles.branch} ${styles.branchTop}`}></div>
          <div className={`${styles.branch} ${styles.branchMiddle}`}></div>
          <div className={`${styles.branch} ${styles.branchBottom}`}></div>
        </div>

        <div className={`${styles.tree} ${styles.tree7}`}>
          <div className={`${styles.branch} ${styles.branchTop}`}></div>
          <div className={`${styles.branch} ${styles.branchMiddle}`}></div>
          <div className={`${styles.branch} ${styles.branchBottom}`}></div>
        </div>
      </div>

      {/* Tent */}
      <div className={styles.tent}>
        <div className={styles.roof}></div>
        <div className={styles.roofBorderLeft}>
          <div
            className={`${styles.roofBorder} ${styles.roofBorder1}`}
          ></div>
          <div
            className={`${styles.roofBorder} ${styles.roofBorder2}`}
          ></div>
          <div
            className={`${styles.roofBorder} ${styles.roofBorder3}`}
          ></div>
        </div>
        <div className={styles.entrance}>
          <div className={`${styles.door} ${styles.leftDoor}`}>
            <div className={styles.leftDoorInner}></div>
          </div>
          <div className={`${styles.door} ${styles.rightDoor}`}>
            <div className={styles.rightDoorInner}></div>
          </div>
        </div>
      </div>

      {/* Floor */}
      <div className={styles.floor}>
        <div className={`${styles.ground} ${styles.ground1}`}></div>
        <div className={`${styles.ground} ${styles.ground2}`}></div>
      </div>

      {/* Fireplace */}
      <div className={styles.fireplace}>
        <div className={styles.support}></div>
        <div className={styles.support}></div>
        <div className={styles.bar}></div>
        <div className={styles.hanger}></div>
        <div className={styles.smoke}></div>
        <div className={styles.pan}></div>
        <div className={styles.fire}>
          <div className={`${styles.line} ${styles.line1}`}>
            <div
              className={`${styles.particle} ${styles.particle1}`}
            ></div>
            <div
              className={`${styles.particle} ${styles.particle2}`}
            ></div>
            <div
              className={`${styles.particle} ${styles.particle3}`}
            ></div>
            <div
              className={`${styles.particle} ${styles.particle4}`}
            ></div>
          </div>
          <div className={`${styles.line} ${styles.line2}`}>
            <div
              className={`${styles.particle} ${styles.particle1}`}
            ></div>
            <div
              className={`${styles.particle} ${styles.particle2}`}
            ></div>
            <div
              className={`${styles.particle} ${styles.particle3}`}
            ></div>
            <div
              className={`${styles.particle} ${styles.particle4}`}
            ></div>
          </div>
          <div className={`${styles.line} ${styles.line3}`}>
            <div
              className={`${styles.particle} ${styles.particle1}`}
            ></div>
            <div
              className={`${styles.particle} ${styles.particle2}`}
            ></div>
            <div
              className={`${styles.particle} ${styles.particle3}`}
            ></div>
            <div
              className={`${styles.particle} ${styles.particle4}`}
            ></div>
          </div>
        </div>
      </div>

      {/* Day / Night cycle */}
      <div className={styles.timeWrapper}>
        <div className={styles.time}>
          <div className={styles.day}></div>
          <div className={styles.night}>
            <div className={styles.moon}></div>
            <div
              className={`${styles.star} ${styles.star1} ${styles.starBig}`}
            ></div>
            <div
              className={`${styles.star} ${styles.star2} ${styles.starBig}`}
            ></div>
            <div
              className={`${styles.star} ${styles.star3} ${styles.starBig}`}
            ></div>
            <div className={`${styles.star} ${styles.star4}`}></div>
            <div className={`${styles.star} ${styles.star5}`}></div>
            <div className={`${styles.star} ${styles.star6}`}></div>
            <div className={`${styles.star} ${styles.star7}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
