from leetcode_py.data_structures import DictTree, RecursiveDict


class Trie(DictTree[str]):

    # Time: O(?)
    # Space: O(?)
    def __init__(self) -> None:
        super().__init__()
        self.root: RecursiveDict[str] = {}

    # Time: O(?)
    # Space: O(?)
    def insert(self, word: str) -> None:
        # TODO: Implement insert
        pass

    # Time: O(?)
    # Space: O(?)
    def search(self, word: str) -> bool:
        # TODO: Implement search
        return False

    # Time: O(?)
    # Space: O(?)
    def starts_with(self, prefix: str) -> bool:
        # TODO: Implement starts_with
        return False
