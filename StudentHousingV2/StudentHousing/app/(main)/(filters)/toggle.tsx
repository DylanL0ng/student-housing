import { Filter } from "@/typings";
import { getSavedFilters, saveFilter } from "@/utils/filterUtils";
import { useEffect, useState } from "react";
import { ListItem, Switch } from "tamagui";

const ToggleFilter = ({ item }: { item: Filter }) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    const value = !isToggled;
    setIsToggled(value);

    saveFilter(item.filter_key, value);
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
          <Switch checked={isToggled} onPress={handleToggle}>
            <Switch.Thumb animation="quicker" />
          </Switch>
        );
      }}
    />
  );
};

export default ToggleFilter;
