${RETURN_CLASS}* ${DEFINE_CLASS}::sh${RETURN_CLASS}Inst() {
    if( !this->${MEMBER_NAME} ) {
        this->${MEMBER_NAME} = new ${RETURN_CLASS}();
        ${INIT_CODE_CONTENT}
    }

    return this->${MEMBER_NAME};
}