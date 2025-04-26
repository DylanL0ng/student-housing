import { Filter } from "@/typings";
import { getSavedFilters, saveFilter } from "@/utils/filterUtils";
import { useEffect, useState } from "react";
import { ListItem, Switch } from "tamagui";

const ToggleFilter = ({
  item,
  onToggle,
}: {
  item: Filter;
  onToggle: (toggle: boolean) => void;
}) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    const value = !isToggled;
    setIsToggled(value);

    saveFilter(item.filter_key, value);
    onToggle(value);
  };

  useEffect(() => {
    (async () => {
      const savedFilters = await getSavedFilters();
      const savedValue = savedFilters[item.filter_key];
      if (savedValue !== undefined) setIsToggled(savedValue);
    })();
  }, [item]);

  return (
    <ListItem
      title={item.label}
      subTitle={item.description}
      pressTheme
      onPress={handleToggle}
      iconAfter={() => {
        return (
          <Switch size={"$1"} checked={isToggled} onPress={handleToggle}>
            <Switch.Thumb animation="quicker" />
          </Switch>
        );
      }}
    />
  );
};

export default ToggleFilter;
