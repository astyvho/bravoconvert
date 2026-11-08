// 페이지를 옮겨 갈 때 사용자가 고른 사진을 다시 고르지 않아도 되도록, 브라우저 안의 IndexedDB 에 잠깐 넣어 둔다.
// 파일은 이 기기를 떠나지 않는다. 받는 쪽이 읽자마자 지우고, 10분이 지난 것은 쓰지 않고 버린다.
// /ko/ 와 영어 페이지는 루트 레이아웃이 달라 이동할 때 전체 페이지가 다시 로드되므로, 메모리 대신 IndexedDB 를 쓴다.

const DB_NAME = "bravoconvert-handoff";
const STORE = "files";
const KEY = "pending";
const TTL_MS = 10 * 60 * 1000;

/** 받는 페이지가 이 쿼리를 보고 넘겨받은 파일을 찾는다. */
export const HANDOFF_PARAM = "handoff";

type Pending = { files: File[]; at: number };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    db =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = work(tx.objectStore(STORE));
        tx.oncomplete = () => { db.close(); resolve(request.result); };
        tx.onerror = () => { db.close(); reject(tx.error); };
        tx.onabort = () => { db.close(); reject(tx.error); };
      }),
  );
}

/** 파일을 넘길 준비를 한다. 저장하지 못하면(사생활 보호 모드 등) false — 받는 쪽에서 다시 고르면 된다. */
export async function putHandoff(files: File[]): Promise<boolean> {
  if (typeof indexedDB === "undefined" || files.length === 0) return false;
  try {
    await run("readwrite", store => store.put({ files, at: Date.now() } satisfies Pending, KEY));
    return true;
  } catch (error) {
    console.warn("Could not hand the files over", error);
    return false;
  }
}

/** 넘겨받은 파일을 꺼내고 바로 지운다. 없거나 오래됐으면 빈 배열. */
export async function takeHandoff(): Promise<File[]> {
  if (typeof indexedDB === "undefined") return [];
  try {
    const pending = await run<Pending | undefined>("readonly", store => store.get(KEY));
    await run("readwrite", store => store.delete(KEY));
    if (!pending || Date.now() - pending.at > TTL_MS) return [];
    return pending.files;
  } catch (error) {
    console.warn("Could not read the handed-over files", error);
    return [];
  }
}

/** 현재 주소에 ?handoff=1 이 있으면 넘겨받은 파일을, 아니면 빈 배열을 돌려준다. */
export async function takeHandoffIfRequested(): Promise<File[]> {
  if (typeof window === "undefined") return [];
  if (new URLSearchParams(window.location.search).get(HANDOFF_PARAM) !== "1") return [];
  return takeHandoff();
}

/** 쿼리 문자열에 handoff=1 을 더한다. */
export function withHandoff(href: string): string {
  return `${href}${href.includes("?") ? "&" : "?"}${HANDOFF_PARAM}=1`;
}
