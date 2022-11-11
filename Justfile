# pull changes from automerge upstream
automerge:
    git fetch automerge main
    git subtree pull --prefix client/vendor/automerge automerge main --squash
